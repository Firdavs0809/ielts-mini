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
  TableRow,
  Avatar,
  Stack,
} from "@mui/material";
import { CheckCircle, Cancel, Help, QueryStats, AccessTime, EmojiEvents } from "@mui/icons-material";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    score,
    total,
    answers = {},
    correct_answers = {},
    time_taken = 0,
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

  const getStatusIcon = (questionId) => {
    const userAnswer = answers[questionId];
    const correctAnswer = correct_answers[questionId];
    if (!userAnswer) return <Help color="warning" />;
    if (userAnswer === correctAnswer) return <CheckCircle color="success" />;
    return <Cancel color="error" />;
  };

  // Professional color mapping
  const bandColor = bandScore >= 7.0 ? "#43a047" : bandScore >= 6.0 ? "#ffa726" : "#e53935";
  const bandLabel = bandScore >= 7.0 ? "Excellent" : bandScore >= 6.0 ? "Competent" : "Needs Improvement";

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{
        p: 4,
        mb: 4,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 4,
        boxShadow: 6,
      }}>
        <Typography variant="h3" color="white" textAlign="center" fontWeight="bold" gutterBottom>
          IELTS Reading Test Results
        </Typography>
        <Typography variant="h6" color="white" textAlign="center" fontWeight="500">
          Academic Reading • Passage 1
        </Typography>
      </Paper>

      {/* Analytics Cards */}
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ p: 3, textAlign: "center", borderRadius: 3, height: "100%" }}>
            <Avatar sx={{ bgcolor: "#1976d2", mx: "auto", mb: 2, width: 56, height: 56 }}>
              <EmojiEvents fontSize="large" />
            </Avatar>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {score} <span style={{ color: "#888" }}>/ {total}</span>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Correct Answers
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <Chip
                label={`Band ${bandScore}`}
                sx={{ bgcolor: bandColor, color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}
                size="medium"
              />
              <Chip
                label={bandLabel}
                color={bandScore >= 7.0 ? "success" : bandScore >= 6.0 ? "warning" : "error"}
                variant="outlined"
                size="medium"
              />
            </Stack>
            <Typography variant="body2" sx={{ mt: 2, color: "#888" }}>
              {percentage.toFixed(1)}% Accuracy
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ p: 3, textAlign: "center", borderRadius: 3, height: "100%" }}>
            <Avatar sx={{ bgcolor: "#ff9800", mx: "auto", mb: 2, width: 56, height: 56 }}>
              <AccessTime fontSize="large" />
            </Avatar>
            <Typography variant="h5" color="text.primary" fontWeight="bold">
              {timeInMinutes}m {timeInSeconds}s
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Time Taken
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              <b>{Object.keys(answers).length}</b> / {total} Questions Answered
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ p: 3, textAlign: "center", borderRadius: 3, height: "100%" }}>
            <Avatar sx={{ bgcolor: "#8e24aa", mx: "auto", mb: 2, width: 56, height: 56 }}>
              <QueryStats fontSize="large" />
            </Avatar>
            <Typography variant="h5" color="text.primary" fontWeight="bold">
              {percentage.toFixed(1)}%
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Overall Accuracy
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Band Level: <b>{bandLabel}</b>
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Question Breakdown */}
      <Paper elevation={3} sx={{ p: 3, mt: 5, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Question-by-Question Breakdown
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">#</TableCell>
                <TableCell align="center">Your Answer</TableCell>
                <TableCell align="center">Correct Answer</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: total }, (_, index) => {
                const questionId = index + 1;
                const userAnswer = answers[questionId];
                const correctAnswer = correct_answers[questionId];
                return (
                  <TableRow key={questionId}>
                    <TableCell align="center">
                      <Typography fontWeight="bold">{questionId}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography color={userAnswer ? "text.primary" : "text.secondary"}>
                        {userAnswer || <em>Not answered</em>}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold">{correctAnswer}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getStatusIcon(questionId)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Feedback */}
      <Paper elevation={2} sx={{ p: 3, mt: 5, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
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
              <ul>
                <li>Reading comprehension strategies</li>
                <li>Time management</li>
                <li>Vocabulary building</li>
                <li>Practice with different question types</li>
              </ul>
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/")}
          sx={{ mr: 2, px: 4, py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Take Another Test
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => window.print()}
          sx={{ px: 4, py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Print Results
        </Button>
      </Box>
    </Container>
  );
}
