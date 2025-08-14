import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { CheckCircle, Cancel, Help } from "@mui/icons-material";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    score, 
    total, 
    answers = {}, 
    correct_answers = {},
    time_taken = 0 
  } = location.state || { score: 0, total: 0 };

  const percentage = total > 0 ? ((score / total) * 100) : 0;
  
  // IELTS Band Score calculation (simplified)
  const getBandScore = (percentage) => {
    if (percentage >= 90) return 9.0;
    if (percentage >= 85) return 8.5;
    if (percentage >= 80) return 8.0;
    if (percentage >= 75) return 7.5;
    if (percentage >= 70) return 7.0;
    if (percentage >= 65) return 6.5;
    if (percentage >= 60) return 6.0;
    if (percentage >= 55) return 5.5;
    if (percentage >= 50) return 5.0;
    if (percentage >= 45) return 4.5;
    if (percentage >= 40) return 4.0;
    return 3.5;
  };

  const bandScore = getBandScore(percentage);
  const timeInMinutes = Math.floor(time_taken / 60);
  const timeInSeconds = time_taken % 60;

  const getQuestionTypeLabel = (type) => {
    switch(type) {
      case "MCQ": return "Multiple Choice";
      case "TRUE_FALSE": return "True/False/Not Given";
      case "FILL_BLANK": return "Fill in the Blanks";
      case "MATCHING": return "Matching";
      default: return type;
    }
  };

  const getStatusIcon = (questionId) => {
    const userAnswer = answers[questionId];
    const correctAnswer = correct_answers[questionId];
    
    if (!userAnswer) return <Help color="warning" />;
    if (userAnswer === correctAnswer) return <CheckCircle color="success" />;
    return <Cancel color="error" />;
  };

  const getStatusColor = (questionId) => {
    const userAnswer = answers[questionId];
    const correctAnswer = correct_answers[questionId];
    
    if (!userAnswer) return "warning";
    if (userAnswer === correctAnswer) return "success";
    return "error";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <Typography variant="h3" color="white" textAlign="center" gutterBottom>
          IELTS Reading Test Results
        </Typography>
        <Typography variant="h6" color="white" textAlign="center">
          Academic Reading • Passage 1
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Score Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {score}/{total}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Correct Answers
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h3" color="secondary" gutterBottom>
              {bandScore}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              IELTS Band Score
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Chip 
                label={`${percentage.toFixed(1)}%`}
                color={percentage >= 70 ? "success" : percentage >= 60 ? "warning" : "error"}
                variant="outlined"
                size="large"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Performance Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1" color="text.secondary">
                  Time Taken:
                </Typography>
                <Typography variant="h6">
                  {timeInMinutes}m {timeInSeconds}s
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="text.secondary">
                  Questions Answered:
                </Typography>
                <Typography variant="h6">
                  {Object.keys(answers).length}/{total}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="text.secondary">
                  Accuracy:
                </Typography>
                <Typography variant="h6" color={percentage >= 70 ? "success.main" : "error.main"}>
                  {percentage.toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="text.secondary">
                  Band Level:
                </Typography>
                <Typography variant="h6">
                  {bandScore >= 7.0 ? "Good" : bandScore >= 6.0 ? "Competent" : "Needs Improvement"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Question Breakdown */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Question-by-Question Breakdown
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Your Answer</TableCell>
                    <TableCell>Correct Answer</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: total }, (_, index) => {
                    const questionId = index + 1;
                    const userAnswer = answers[questionId];
                    const correctAnswer = correct_answers[questionId];
                    
                    return (
                      <TableRow key={questionId}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold">
                            {questionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="MCQ" 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={userAnswer ? "text.primary" : "text.secondary"}
                          >
                            {userAnswer || "Not answered"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {correctAnswer}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusIcon(questionId)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Feedback */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Feedback
            </Typography>
            
            {bandScore >= 7.0 ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6">Excellent Performance!</Typography>
                <Typography>
                  You've achieved a strong band score of {bandScore}. Your reading comprehension skills are well-developed. 
                  Continue practicing to maintain this level of performance.
                </Typography>
              </Alert>
            ) : bandScore >= 6.0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="h6">Good Performance</Typography>
                <Typography>
                  You've achieved a competent band score of {bandScore}. Focus on improving your reading speed and 
                  comprehension of complex passages to reach higher band scores.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="h6">Needs Improvement</Typography>
                <Typography>
                  Your current band score of {bandScore} indicates areas for improvement. Focus on:
                  • Reading comprehension strategies
                  • Time management
                  • Vocabulary building
                  • Practice with different question types
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate("/")}
          sx={{ mr: 2, px: 4 }}
        >
          Take Another Test
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large"
          onClick={() => window.print()}
          sx={{ px: 4 }}
        >
          Print Results
        </Button>
      </Box>
    </Container>
  );
}
