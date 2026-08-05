import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface DayTask {
  day: number
  title: string
  lesson: string
  exercise: string
  completed: boolean
}

export default function Roadmap() {
  const location = useLocation()
  const [roadmap, setRoadmap] = useState<DayTask[]>([])

  useEffect(() => {
    // Generate roadmap based on missing skills
    const mockRoadmap: DayTask[] = [
      
      {
        day: 1,
        title: 'Introduction to Python Basics',
        lesson: 'Learn Python syntax, variables, and data types. Focus on fundamentals.',
        exercise: 'Write a program that takes user input and performs basic calculations.',
        completed: false
      },
      {
        day: 2,
        title: 'React Fundamentals',
        lesson: 'Understand components, props, and state in React.',
        exercise: 'Build a simple counter component with state management.',
        completed: false
      },
      {
        day: 3,
        title: 'AWS Basics - EC2 & S3',
        lesson: 'Learn about cloud computing basics and AWS core services.',
        exercise: 'Create a free AWS account and launch your first EC2 instance.',
        completed: false
      },
      {
        day: 4,
        title: 'Docker Containers',
        lesson: 'Understanding containerization and Docker fundamentals.',
        exercise: 'Create a Dockerfile for a simple Node.js application.',
        completed: false
      },
      {
        day: 5,
        title: 'REST API Design',
        lesson: 'Learn REST principles and API best practices.',
        exercise: 'Design a simple REST API for a todo application.',
        completed: false
      },
      {
        day: 6,
        title: 'Git & Version Control',
        lesson: 'Master Git workflows and collaboration techniques.',
        exercise: 'Create a Git repository and practice branching strategies.',
        completed: false
      },
      {
        day: 7,
        title: 'Portfolio Project',
        lesson: 'Apply all learned skills to build a mini project.',
        exercise: 'Create a full-stack application using React, Python, and Docker.',
        completed: false
      }
    ]
    
    setRoadmap(mockRoadmap)
  }, [location.state])

  const toggleComplete = (day: number) => {
    setRoadmap(roadmap.map(task =>
      task.day === day ? { ...task, completed: !task.completed } : task
    ))
  }

  const nextBestAction = roadmap.find(task => !task.completed)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Learning Roadmap</h1>
        <p className="text-gray-600 mb-8">7-day plan to bridge your skill gaps</p>

        {nextBestAction && (
          <div className="bg-indigo-600 text-white rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">🎯 Next Best Action</h2>
            <p className="text-lg mb-1">Day {nextBestAction.day}: {nextBestAction.title}</p>
            <p className="opacity-90">{nextBestAction.lesson}</p>
          </div>
        )}

        <div className="space-y-4">
          {roadmap.map((task) => (
            <div
              key={task.day}
              className={`bg-white rounded-lg shadow p-6 ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-indigo-600">DAY {task.day}</span>
                    <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-3">{task.lesson}</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Exercise:</p>
                    <p className="text-sm text-blue-800">{task.exercise}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleComplete(task.day)}
                  className={`ml-4 px-4 py-2 rounded-lg font-semibold ${
                    task.completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {task.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need more resources?</p>
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Explore roadmap.sh →
          </a>
        </div>
      </div>
    </div>
  )
}
