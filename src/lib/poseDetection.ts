import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

let detector: poseDetection.PoseDetector | null = null;

export const initPoseDetector = async () => {
  if (detector) return detector;
  
  await tf.ready();
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
  };
  
  detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
};

export const getPose = async (video: HTMLVideoElement) => {
  if (!detector) return null;
  const poses = await detector.estimatePoses(video);
  return poses[0] || null;
};
