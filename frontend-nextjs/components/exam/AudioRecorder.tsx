'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // seconds
}

/**
 * Audio Recorder component for Speaking module
 * Records audio and provides playback before submission
 */
export default function AudioRecorder({
  onRecordingComplete,
  maxDuration = 300, // 5 minutes default
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (recordedAudio && audioRef.current) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <audio ref={audioRef} />
      
      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {!isRecording && !recordedAudio && (
          <Button
            onClick={startRecording}
            className="w-16 h-16 rounded-full"
            size="icon"
          >
            <Mic className="w-6 h-6" />
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="w-16 h-16 rounded-full"
              size="icon"
            >
              <Square className="w-6 h-6" />
            </Button>
            <div className="text-lg font-mono font-semibold text-red-600">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Recording...</span>
            </div>
          </>
        )}

        {recordedAudio && !isRecording && (
          <div className="flex items-center gap-4">
            <Button
              onClick={isPlaying ? stopPlayback : playRecording}
              variant="outline"
              size="icon"
              className="w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <span className="text-sm text-gray-600">
              Recording complete ({formatTime(recordingTime)})
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 text-center">
        {!recordedAudio && (
          <p>Click the microphone to start recording. Maximum duration: {formatTime(maxDuration)}</p>
        )}
        {recordedAudio && (
          <p>You can play back your recording before submitting.</p>
        )}
      </div>
    </div>
  );
}

