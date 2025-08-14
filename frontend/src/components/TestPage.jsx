import React, { useEffect, useState } from "react";
import { 
  Container, Typography, Radio, RadioGroup, FormControlLabel, Button, Card, CardContent,
  Box, Paper, Divider, Grid, Alert, LinearProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import axios from "axios";
import Timer from "./Timer";
import { useNavigate } from "react-router-dom";

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [readingPassage, setReadingPassage] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeUp, setTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [testId, setTestId] = useState(null);
  const navigate = useNavigate();

  // Only fetch passage/questions after test is started
  useEffect(() => {
    if (testStarted) {
      axios.get("http://localhost:8000/api/reading-test/")
        .then(res => {
          // Use 'content' for passage text
          setReadingPassage(res.data.content || res.data.passage || "No passage found");
          setQuestions(res.data.questions || []);
          setTestId(res.data.test_id);
        })
        .catch(err => console.error(err));
    }
  }, [testStarted]);

  // Handle starting the test
  const handleStartTest = () => {
    setConfirmOpen(true);
  };

  const handleConfirmStart = () => {
    setConfirmOpen(false);
    axios.post("http://localhost:8000/api/start-reading-test/")
      .then((res) => {
        if (res.status === 201 && res.data.session_id) {
          setTestStarted(true);
          setTestId(res.data.session_id);
          localStorage.setItem("reading_session_id", res.data.session_id); // <-- Store in localStorage
        } else {
          alert("Failed to start test. Try again.");
        }
        setConfirmOpen(false);
      })
      .catch((err) => {
        setConfirmOpen(false);
        alert("Failed to start test. Try again.");
      });
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    const sessionId = localStorage.getItem("reading_session_id");
    axios.post("http://localhost:8000/api/end-session/", { session_id: sessionId })
      .then(() => {
        handleSubmit();
      })
      .catch((err) => {
        console.error("Failed to end session:", err);
        handleSubmit();
      });
  };

  const handleSubmit = () => {
    if (isSubmitting || !testStarted) return;
    setIsSubmitting(true);
    const sessionId = localStorage.getItem("reading_session_id");
    axios.post("http://localhost:8000/api/submit-reading/", { 
      answers,
      session_id: sessionId // <-- use session_id from localStorage
    })
      .then(res => {
        navigate("/result", { 
          state: { 
            score: res.data.score, 
            total: res.data.total,
            answers: res.data.answers,
            correct_answers: res.data.correct_answers
          } 
        });
      })
      .catch(err => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  const getQuestionTypeLabel = (type) => {
    switch(type) {
      case "MCQ": return "Multiple Choice";
      case "TRUE_FALSE": return "True/False/Not Given";
      case "FILL_BLANK": return "Fill in the Blanks";
      case "MATCHING": return "Matching";
      default: return type;
    }
  };

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case "MCQ":
        return (
          <RadioGroup
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          >
            {question.option_a && <FormControlLabel value="A" control={<Radio />} label={question.option_a} />}
            {question.option_b && <FormControlLabel value="B" control={<Radio />} label={question.option_b} />}
            {question.option_c && <FormControlLabel value="C" control={<Radio />} label={question.option_c} />}
            {question.option_d && <FormControlLabel value="D" control={<Radio />} label={question.option_d} />}
          </RadioGroup>
        );
      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          >
            <FormControlLabel value="TRUE" control={<Radio />} label="True" />
            <FormControlLabel value="FALSE" control={<Radio />} label="False" />
            <FormControlLabel value="NOT_GIVEN" control={<Radio />} label="Not Given" />
          </RadioGroup>
        );
      case "FILL_BLANK":
        return (
          <input
            type="text"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px"
            }}
            placeholder="Type your answer here..."
          />
        );
      case "MATCHING":
        return (
          <input
            type="text"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px"
            }}
            placeholder="Type your matching answer here..."
          />
        );
      case "TEXT":
        return (
          <textarea
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
              minHeight: "60px"
            }}
            placeholder="Write your answer here..."
          />
        );
      default:
        return <Typography color="error">Unsupported question type</Typography>;
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Start Test?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to start the test? The timer will begin and you cannot pause or restart.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmStart} variant="contained" color="primary">Start</Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: "#f5f5f5" }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" color="primary" fontWeight="bold">
              IELTS Academic Reading Test
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Reading Passage 1 of 3
            </Typography>
          </Grid>
          <Grid item>
            {testStarted && (
              <Timer minutes={60} onTimeUp={handleTimeUp} />
            )}
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Progress: {answeredCount} of {questions.length} questions answered
          </Typography>
        </Box>
      </Paper>

      {/* Before Test Starts */}
      {!testStarted && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Welcome to the IELTS Academic Reading Test
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You will have 60 minutes to complete 13-14 questions for this passage. 
            Once you start, the timer will begin and you cannot pause or restart. 
            Please ensure you are ready before starting.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleStartTest}
            sx={{ px: 4, py: 1.5, fontSize: "18px" }}
          >
            Start Test
          </Button>
        </Paper>
      )}

      {/* After Test Starts */}
      {testStarted && (
        <>
          {timeUp && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Time's up! Your test will be submitted automatically.
            </Alert>
          )}

          {/* Force side-by-side layout */}
          <Box sx={{
            display: 'flex',
            gap: 3,
            height: '70vh',
            minHeight: '400px'
          }}>
            {/* Passage - left half */}
            <Paper elevation={2} sx={{ flex: 1, p: 3, overflow: "auto", display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                READING PASSAGE 1
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.8, 
                  fontSize: "16px",
                  textAlign: "justify",
                  flex: 1
                }}
              >
                {readingPassage || "Loading reading passage..."}
              </Typography>
            </Paper>

            {/* Questions - right half */}
            <Paper elevation={2} sx={{ flex: 1, p: 3, overflow: "auto", display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Questions 1-{questions.length}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {questions.map((question, index) => (
                  <Card key={question.id} sx={{ mb: 3, border: answers[question.id] ? "2px solid #4caf50" : "1px solid #e0e0e0" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ mr: 2, fontWeight: "bold" }}>
                          {index + 1}.
                        </Typography>
                        <Chip 
                          label={getQuestionTypeLabel(question.question_type)} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        {question.question_text}
                      </Typography>
                      {renderQuestion(question)}
                      {answers[question.id] && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          Answer saved: {answers[question.id]}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting || timeUp}
              sx={{ px: 4, py: 1.5, fontSize: "18px" }}
            >
              {isSubmitting ? "Submitting..." : timeUp ? "Time's Up!" : "Submit Reading Test"}
            </Button>
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              You have answered {answeredCount} out of {questions.length} questions
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
}
