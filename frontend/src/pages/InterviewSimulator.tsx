import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, PlayCircle, RotateCcw, Sparkles, TrendingUp, AlertCircle, Loader } from 'lucide-react';

interface Analysis {
  score: number;
  metrics: {
    fillerWords: number;
    duration: number;
    wordCount?: number;
    speakingRate: number;
  };
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  recommendations: string[];
}

const InterviewSimulator = () => {
  const [stage, setStage] = useState('setup'); // setup, generating, intro, listening, analyzing, results
  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Software Engineer');
  const [customRole, setCustomRole] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [fillerCount, setFillerCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const fillerWords = [
    'um', 'uh', 'like', 'you know', 'basically', 'actually', 
    'sort of', 'kind of', 'i mean', 'you see', 'literally',
    'honestly', 'obviously', 'clearly', 'essentially', 'right',
    'okay', 'so', 'well', 'just', 'really', 'very',
    'pretty much', 'at the end of the day', 'to be honest',
    'you know what i mean', 'if that makes sense', 'stuff like that',
    'and everything', 'and stuff', 'whatever', 'anyways'
  ];

  // Generate interview question using backend API
  const generateQuestion = async () => {
    setStage('generating');
    setError('');

    const roleToUse = useCustomRole ? customRole : role;

    try {
      const response = await fetch('https://vector-backend-ijym.onrender.com/api/interview/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: company,
          role: roleToUse
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate question');
      }

      const data = await response.json();
      const question = data.question;
      
      setCurrentQuestion(question);
      setStage('intro');
      
      setTimeout(() => {
        setStage('listening');
        startRecording();
      }, 7000);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(`Failed to generate question: ${message}`);
    setStage('setup');
    }
  };

  const startInterview = () => {
    if (useCustomRole && !customRole.trim()) {
      setError('Please enter a custom role or use predefined roles');
      return;
    }

    generateQuestion();
  };

  const startRecording = () => {
    setTranscript('');
    setFillerCount(0);
    setDuration(0);
    setError('');

    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Chrome or Edge browser.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 1;
    
    // More sensitive settings for better filler word detection
    if (recognitionRef.current.interimResults !== undefined) {
      recognitionRef.current.interimResults = true;
    }

    let fullTranscript = '';
    let detectedFillers = new Set(); // Track unique filler instances

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullTranscript += transcript + ' ';
          
          // More aggressive filler detection
          const lowerText = ' ' + transcript.toLowerCase() + ' ';
          
          fillerWords.forEach(filler => {
            // Check for word boundaries and common variations
            const patterns = [
              new RegExp(`\\b${filler}\\b`, 'g'),
              new RegExp(`\\b${filler}s\\b`, 'g'), // plural forms like "likes"
              new RegExp(`\\b${filler},`, 'g'), // followed by comma
              new RegExp(`\\b${filler}\\.`, 'g'), // followed by period
            ];
            
            patterns.forEach(pattern => {
              const matches = lowerText.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  const uniqueKey = `${match}-${i}-${Date.now()}`;
                  if (!detectedFillers.has(uniqueKey)) {
                    detectedFillers.add(uniqueKey);
                    setFillerCount(prev => prev + 1);
                  }
                });
              }
            });
          });
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(fullTranscript + interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      }
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (transcript.trim().length > 0) {
      analyzeAnswer();
    } else {
      setError('No speech detected. Please try again and speak clearly.');
    }
  };

  const analyzeAnswer = async () => {
    setStage('analyzing');
    
    try {
      const response = await fetch('https://vector-backend-ijym.onrender.com/api/interview/analyze-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          transcript: transcript,
          fillerCount: fillerCount,
          duration: duration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze answer');
      }

      const data = await response.json();
      const analysisData = data.analysis;
      
      setAnalysis({
        ...analysisData,
        metrics: data.metrics
      });
      
      setStage('results');
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Fallback to simple analysis if API fails
      const wordCount = transcript.split(' ').length;
      const speakingRate = Math.round(wordCount / (duration / 60));
      
      let score = 70;
      if (fillerCount === 0) score += 15;
      else if (fillerCount <= 3) score += 10;
      else if (fillerCount <= 6) score += 5;
      else score -= (fillerCount - 6) * 2;
      
      if (duration < 30) score -= 15;
      else if (duration >= 60 && duration <= 120) score += 10;
      else if (duration > 180) score -= 10;
      
      score = Math.min(100, Math.max(0, score));
      
      setAnalysis({
        score: score,
        metrics: {
          fillerWords: fillerCount,
          duration: duration,
          wordCount: wordCount,
          speakingRate: speakingRate
        },
        strengths: [
          fillerCount <= 3 ? 'Minimal filler words show confidence' : 'You provided a response',
          duration >= 60 && duration <= 120 ? 'Good answer length' : 'You attempted the question'
        ],
        weaknesses: [
          fillerCount > 6 ? `Too many filler words (${fillerCount})` : 'Consider using the STAR method',
          duration < 30 ? 'Answer too brief - add examples' : duration > 180 ? 'Answer too long - be concise' : 'Practice structuring your response'
        ],
        idealAnswer: 'A strong answer would use the STAR method: describe the Situation, explain the Task, detail your Actions, and highlight Results. Include specific metrics and what you learned.',
        recommendations: [
          fillerCount > 5 ? 'Practice pausing instead of using filler words' : 'Continue practicing regularly',
          'Use the STAR framework for structured responses',
          'Include specific examples and quantifiable results'
        ]
      });
      
      setStage('results');
    }
  };

  const reset = () => {
    setStage('setup');
    setTranscript('');
    setFillerCount(0);
    setDuration(0);
    setAnalysis(null);
    setError('');
    setCurrentQuestion('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #eef7ff 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #002366 0%, #005599 100%)', padding: '30px', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={32} />
            AI Interview Simulator
          </h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
            AI-powered dynamic questions & real-time feedback
          </p>
        </div>

        {/* Setup Stage */}
        {stage === 'setup' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ marginTop: 0 }}>Configure Your Mock Interview</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Company
              </label>
              <select 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              >
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Meta">Meta</option>
                <option value="Apple">Apple</option>
                <option value="Netflix">Netflix</option>
                <option value="Tesla">Tesla</option>
                <option value="OpenAI">OpenAI</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useCustomRole}
                  onChange={(e) => setUseCustomRole(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600, color: '#333' }}>Use Custom Role</span>
              </label>

              {!useCustomRole ? (
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="UX Designer">UX Designer</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g., Machine Learning Engineer, Frontend Developer, Sales Engineer..."
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px', 
                    borderRadius: '8px', 
                    border: '2px solid #002366'
                  }}
                />
              )}
            </div>

            {error && (
              <div style={{ 
                background: '#fee', 
                border: '2px solid #fcc', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle color="#c00" />
                <span style={{ color: '#c00' }}>{error}</span>
              </div>
            )}

            <button 
              onClick={startInterview}
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '18px', 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #002366 0%, #005599 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={24} />
              Generate AI Interview Question
            </button>
          </div>
        )}

        {/* Generating Stage */}
        {stage === 'generating' && (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              border: '4px solid #002366', 
              borderTopColor: 'transparent',
              borderRadius: '50%', 
              margin: '0 auto 24px',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ color: '#333' }}>AI Generating Your Question...</h2>
            <p style={{ color: '#666' }}>Creating a realistic {useCustomRole ? customRole : role} interview question for {company}</p>
          </div>
        )}

        {/* Intro Stage */}
        {stage === 'intro' && (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #002366 0%, #005599 100%)', 
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <Sparkles size={60} color="white" />
            </div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>AI Interviewer Speaking...</h2>
            <p style={{ fontSize: '20px', color: '#666', fontStyle: 'italic', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
              "{currentQuestion}"
            </p>
            <p style={{ marginTop: '24px', color: '#999' }}>Get ready to answer...</p>
          </div>
        )}

        {/* Listening Stage */}
        {stage === 'listening' && (
          <div style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: '#333', marginBottom: '16px' }}>Your Turn to Speak</h2>
              <p style={{ color: '#666', fontSize: '16px', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
                "{currentQuestion}"
              </p>
            </div>

            {error && (
              <div style={{ 
                background: '#fee', 
                border: '2px solid #fcc', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle color="#c00" />
                <span style={{ color: '#c00' }}>{error}</span>
              </div>
            )}

            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '12px', 
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: fillerCount > 5 ? '#ea4335' : '#34a853' }}>
                    {fillerCount}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Filler Words</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#002366' }}>
                    {formatTime(duration)}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Time Elapsed</div>
                </div>
              </div>

              {transcript && (
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '8px',
                  minHeight: '100px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#333'
                }}>
                  {transcript}
                </div>
              )}
            </div>

            <button 
              onClick={stopRecording}
              disabled={!isRecording}
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '18px', 
                fontWeight: 600,
                background: isRecording ? '#ea4335' : '#ccc', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: isRecording ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MicOff size={24} />
              Stop & Analyze Answer
            </button>
          </div>
        )}

        {/* Analyzing Stage */}
        {stage === 'analyzing' && (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              border: '4px solid #002366', 
              borderTopColor: 'transparent',
              borderRadius: '50%', 
              margin: '0 auto 24px',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ color: '#333' }}>AI Analyzing Your Performance...</h2>
            <p style={{ color: '#666' }}>Evaluating content, delivery, and providing personalized feedback</p>
          </div>
        )}

        {/* Results Stage */}
        {stage === 'results' && analysis && (
          <div style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                fontSize: '72px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #002366 0%, #005599 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {analysis.score}
              </div>
              <div style={{ fontSize: '24px', color: '#666' }}>Overall Score</div>
            </div>

            {/* Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: analysis.metrics.fillerWords > 5 ? '#ea4335' : '#34a853' }}>
                  {analysis.metrics.fillerWords}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Filler Words</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                  {formatTime(analysis.metrics.duration)}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Duration</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#005599' }}>
                  {analysis.metrics.speakingRate}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Words/Min</div>
              </div>
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#34a853', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={24} />
                Strengths
              </h3>
              <ul style={{ lineHeight: 1.8 }}>
                {analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} style={{ color: '#333' }}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#ea4335', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={24} />
                Areas to Improve
              </h3>
              <ul style={{ lineHeight: 1.8 }}>
                {analysis.weaknesses.map((weakness: string, i: number) => (
                  <li key={i} style={{ color: '#333' }}>{weakness}</li>
                ))}
              </ul>
            </div>

            {/* Ideal Answer */}
            <div style={{ 
              background: '#e8f5e9', 
              padding: '24px', 
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✨ Example of a Strong Answer</h3>
              <p style={{ color: '#333', lineHeight: 1.6, margin: 0 }}>{analysis.idealAnswer}</p>
            </div>

            {/* Recommendations */}
            <div style={{ 
              background: '#fff3e0', 
              padding: '24px', 
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#f57c00', marginTop: 0 }}>💡 Personalized Recommendations</h3>
              <ul style={{ margin: 0, lineHeight: 1.8 }}>
                {analysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} style={{ color: '#333' }}>{rec}</li>
                ))}
              </ul>
            </div>

            <button 
              onClick={reset}
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '18px', 
fontWeight: 600,
background: 'linear-gradient(135deg, #002366 0%, #005599 100%)',                 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RotateCcw size={24} />
              Try Another Interview
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InterviewSimulator;
