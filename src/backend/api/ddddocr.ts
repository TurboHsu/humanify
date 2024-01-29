/* Credits:
Took some code from: https://github.com/J3n5en/ddddocr-js, thx!
*/
import { API } from '../api';
import Jimp from "jimp"; // TODO: This lib uses process.env, which is not good
import { Tensor, InferenceSession } from "onnxruntime-web";
// import Jimp from "jimp/browser/lib/jimp";

class OCR {
  #charsets: string[];
  #session: InferenceSession;

  private constructor(session: InferenceSession, charsets: string[]) {
    this.#session = session;
    this.#charsets = charsets;
  }

  static async create() {
    // Access public folder for static resources
    const charsets = await fetch('/static/ddddocr/charsets.json').then((response) => response.json());
    const session = await InferenceSession.create('/static/ddddocr/common.onnx', { executionProviders: ['webgl'], graphOptimizationLevel: 'all' });
    return new OCR(session, charsets);
  }

  async classification(dataURL: string) {
    const { image, dims } = await this.loadImage(dataURL);
    const inputTensor = this.coverImageToTensor(image, dims);
    const {
      output: { data: outputData },
    } = await this.#session.run({ input1: inputTensor });

    return [...outputData]
      .filter(Boolean)
      .map((i) => this.#charsets[Number(i)])
      .join("");
  }

  private async loadImage(dataURL: string) {
    // Fetch data URL and convert to ArrayBuffer
    const response = await fetch(dataURL);
    const buffer = await response.arrayBuffer();

    return Jimp.read(buffer).then((imageBuffer) => {
      var width = imageBuffer.bitmap.width;
      var height = imageBuffer.bitmap.height;
      const dims = [1, 1, 64, Math.floor(width * (64 / height))];
      return {
        image: imageBuffer.resize(dims[3], dims[2]).grayscale(),
        dims,
      };
    });
  }

  private coverImageToTensor(image: Jimp, dims: number[]) {
    const redArray: number[] = [];
    const greenArray: number[] = [];
    const blueArray: number[] = [];
    for (let i = 0; i < image.bitmap.data.length; i += 4) {
      redArray.push(image.bitmap.data[i]);
      greenArray.push(image.bitmap.data[i + 1]);
      blueArray.push(image.bitmap.data[i + 2]);
    }

    const transposedData = redArray.concat(greenArray).concat(blueArray);

    const float32Data = new Float32Array(dims.reduce((a, b) => a * b));
    for (let i = 0; i < transposedData.length; i++) {
      float32Data[i] = transposedData[i] / 255.0;
    }

    return new Tensor("float32", float32Data, dims);
  }
}
// Creates an API class
class LocalDDDDOCRAPI implements API {
    // Get the image from the API
    async runOCR(image: string): Promise<string> {
        const api = await OCR.create()
        const result = await api.classification(image);
        return result;
    }
}

export default LocalDDDDOCRAPI;