import * as tf from '@tensorflow/tfjs';

// Basic signature comparison using pixel values
export const compareSignatures = (signature1, signature2) => {
  const img1 = tf.browser.fromPixels(signature1);
  const img2 = tf.browser.fromPixels(signature2);

  // Ensure both images are the same size
  const size = Math.max(img1.shape[0], img2.shape[0]);
  const resizedImg1 = tf.image.resizeBilinear(img1, [size, size]);
  const resizedImg2 = tf.image.resizeBilinear(img2, [size, size]);

  const diff = tf.sub(resizedImg1, resizedImg2).abs();
  const totalDifference = tf.sum(diff).arraySync();

  // Threshold for similarity (adjust based on needs)
  return totalDifference < 1000; // Adjust this threshold
};
