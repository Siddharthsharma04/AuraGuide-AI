import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

interface CameraStreamProps {
  isActive: boolean;
  onAlert: (object: string, position: string, allObjects: string[]) => void;
}

const CameraStream: React.FC<CameraStreamProps> = ({ isActive, onAlert }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      console.log('TF Model loaded.');
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (isActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Camera access error:', err));
    }
  }, [isActive]);

  useEffect(() => {
    let animationId: number;

    const detectFrame = async () => {
      if (model && videoRef.current && videoRef.current.readyState === 4) {
        const predictions = await model.detect(videoRef.current);
        drawPredictions(predictions);
      }
      animationId = requestAnimationFrame(detectFrame);
    };

    if (model) detectFrame();
    return () => cancelAnimationFrame(animationId);
  }, [model]);

  const drawPredictions = (predictions: cocoSsd.DetectedObject[]) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const allDetectedLabels = predictions.map(p => p.class);
    
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      
      // Draw detection box
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Label background
      ctx.fillStyle = '#ffff00';
      const textWidth = ctx.measureText(prediction.class).width;
      ctx.fillRect(x, y, textWidth + 10, 25);

      // Label text
      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(prediction.class, x + 5, y + 20);

      // Proactive Spatial Logic
      const relevantObjects = ['person', 'car', 'bus', 'truck', 'stop sign', 'bicycle'];
      if (relevantObjects.includes(prediction.class) && canvasRef.current) {
        const midPoint = x + width / 2;
        const relativePosition = midPoint / canvasRef.current.width;
        
        let positionStr = 'directly ahead';
        if (relativePosition < 0.3) positionStr = 'on your left';
        if (relativePosition > 0.7) positionStr = 'on your right';
        
        onAlert(prediction.class, positionStr, allDetectedLabels);
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  );
};

export default CameraStream;
