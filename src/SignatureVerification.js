import * as tf from '@tensorflow/tfjs';

// Signature comparison function to calculate similarity score
export const compareSignatures = async (signature1, signature2) => {
  const img1 = await tf.browser.fromPixels(signature1);
  const img2 = await tf.browser.fromPixels(signature2);

  // Ensure both images are the same size
  const size = Math.max(img1.shape[0], img2.shape[0]);
  const resizedImg1 = tf.image.resizeBilinear(img1, [size, size]);
  const resizedImg2 = tf.image.resizeBilinear(img2, [size, size]);

  const diff = tf.sub(resizedImg1, resizedImg2).abs();
  const totalDifference = tf.sum(diff).arraySync();

  // Normalize the score to return a value between 0 (identical) and 1 (completely different)
  const maxDifference = size * size * 255; // Maximum possible difference for a given size
  const similarityScore = 1 - (totalDifference / maxDifference);

  return similarityScore; // Return a score between 0 and 1
};
