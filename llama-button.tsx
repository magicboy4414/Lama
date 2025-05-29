"use client"

import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

export default function Component() {
  const [showLlama, setShowLlama] = useState(false)
  const [webcamActive, setWebcamActive] = useState(false)
  const [webcamError, setWebcamError] = useState<string | null>(null)
  const [browserSupported, setBrowserSupported] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check if browser supports getUserMedia
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setBrowserSupported(false)
      setWebcamError("Your browser doesn't support webcam access")
    }
  }, [])

  const handleButtonClick = () => {
    setShowLlama(!showLlama)
  }

  const startWebcam = async () => {
    try {
      setWebcamError(null)
      console.log("Attempting to access webcam...")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })

      console.log("Webcam access granted:", stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Make sure video is playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log("Video is playing")
                setWebcamActive(true)
              })
              .catch((err) => {
                console.error("Error playing video:", err)
                setWebcamError("Error playing video: " + err.message)
              })
          }
        }
      }
    } catch (error: any) {
      console.error("Error accessing webcam:", error)
      setWebcamError(`Unable to access webcam: ${error.message || "Permission denied"}`)
    }
  }

  const stopWebcam = () => {
    console.log("Stopping webcam...")
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track)
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setWebcamActive(false)
  }

  // Check if video is actually playing
  useEffect(() => {
    if (webcamActive && videoRef.current) {
      const checkVideoPlaying = setInterval(() => {
        if (
          videoRef.current &&
          videoRef.current.readyState === 4 &&
          !videoRef.current.paused &&
          videoRef.current.currentTime > 0
        ) {
          console.log("Video confirmed playing")
          clearInterval(checkVideoPlaying)
        } else if (videoRef.current && webcamActive) {
          console.log("Video not playing yet, readyState:", videoRef.current.readyState)
        }
      }, 1000)

      return () => clearInterval(checkVideoPlaying)
    }
  }, [webcamActive])

  useEffect(() => {
    return () => {
      // Cleanup webcam when component unmounts
      stopWebcam()
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Magic - Llama - Button</h1>

        <Button
          onClick={handleButtonClick}
          size="lg"
          className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transform transition-all duration-200 hover:scale-105"
        >
          {showLlama ? "Hide Llama" : "Summon Llama"} ✨
        </Button>

        {browserSupported ? (
          <Button
            onClick={webcamActive ? stopWebcam : startWebcam}
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transform transition-all duration-200 hover:scale-105"
          >
            {webcamActive ? "Stop Webcam" : "Start Webcam"} 📹
          </Button>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Webcam not supported in your browser
          </div>
        )}

        {webcamError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">{webcamError}</div>
        )}

        {showLlama && (
          <div className="mt-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="text-8xl mb-4 animate-bounce">🦙</div>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hello! I'm Larry the Llama!</h2>
              <p className="text-gray-600">Thanks for summoning me! I hope you're having a wonderful day! 🌟</p>
            </div>
          </div>
        )}

        {/* Always show the webcam square container */}
        <div className="mt-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">📹 Webcam Feed</h3>
            <div className="relative">
              {/* Square container for webcam */}
              <div className="w-80 h-80 mx-auto border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover rounded-lg ${webcamActive ? "block" : "hidden"}`}
                />

                {webcamActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🔴 LIVE
                  </div>
                )}

                {!webcamActive && (
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📹</div>
                    <p className="text-lg font-medium">Webcam Feed</p>
                    <p className="text-sm">Click "Start Webcam" to begin</p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-gray-600 mt-3">
              {webcamActive ? (
                <span className="text-green-600 font-medium">Your webcam is now active!</span>
              ) : (
                <span>Webcam is currently off</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
