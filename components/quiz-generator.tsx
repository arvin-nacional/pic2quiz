"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { generateQuiz } from "@/lib/actions";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizGeneratorProps {
  imageUrl: string;
}

export function QuizGenerator({ imageUrl }: QuizGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        const quizData = await generateQuiz(imageUrl);
        setQuiz(quizData);
      } catch (err) {
        console.error("Failed to generate quiz:", err);
        setError(
          "Failed to generate quiz. The image might not contain enough recognizable content."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [imageUrl]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer

    setSelectedAnswer(answerIndex);

    if (answerIndex === quiz[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
        <p className="text-slate-600">
          Analyzing image and generating quiz questions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-md">
        <h3 className="font-medium mb-2">Error</h3>
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-xl mb-6">
          Your score: <span className="font-bold">{score}</span> out of{" "}
          {quiz.length}
        </p>
        <div className="mb-8">
          {score === quiz.length ? (
            <div className="flex flex-col items-center text-green-600">
              <CheckCircle2 className="h-16 w-16 mb-2" />
              <p className="text-lg">Perfect score! Amazing job!</p>
            </div>
          ) : score >= quiz.length / 2 ? (
            <div className="flex flex-col items-center text-amber-600">
              <CheckCircle2 className="h-16 w-16 mb-2" />
              <p className="text-lg">Good job! You passed the quiz.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-red-600">
              <XCircle className="h-16 w-16 mb-2" />
              <p className="text-lg">Better luck next time!</p>
            </div>
          )}
        </div>
        <Button onClick={handleRestartQuiz}>Try Again</Button>
      </Card>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="bg-amber-50 text-amber-700 p-6 rounded-md">
        <h3 className="font-medium mb-2">No Questions Generated</h3>
        <p>
          We couldn't generate quiz questions from this image. Try uploading a
          different image with more recognizable content.
        </p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Question {currentQuestion + 1} of {quiz.length}
        </h2>
        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">
          Score: {score}
        </span>
      </div>

      <p className="text-lg mb-6">{quiz[currentQuestion].question}</p>

      <div className="space-y-3 mb-6">
        {quiz[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              selectedAnswer === null
                ? "hover:bg-slate-50"
                : selectedAnswer === index
                  ? index === quiz[currentQuestion].correctAnswer
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                  : index === quiz[currentQuestion].correctAnswer &&
                      selectedAnswer !== null
                    ? "bg-green-50 border-green-300"
                    : "bg-slate-50 border-slate-200"
            }`}
            onClick={() => handleAnswerSelect(index)}
            disabled={selectedAnswer !== null}
          >
            <div className="flex items-center">
              <span className="mr-3 flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>

              {selectedAnswer !== null &&
                index === quiz[currentQuestion].correctAnswer && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}

              {selectedAnswer === index &&
                index !== quiz[currentQuestion].correctAnswer && (
                  <XCircle className="ml-auto h-5 w-5 text-red-600" />
                )}
            </div>
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <Button onClick={handleNextQuestion} className="w-full">
          {currentQuestion < quiz.length - 1 ? "Next Question" : "See Results"}
        </Button>
      )}
    </Card>
  );
}
