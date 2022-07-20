import { Alert, Image } from "react-native";
import {
  cacheDirectory,
  EncodingType,
  readAsStringAsync,
  StorageAccessFramework,
} from "expo-file-system";
import { uniqueId } from "lodash";
import { launchImageLibrary } from "react-native-image-picker";
import { ImageBase64Data, ImageDimensions, ImageFileUri } from "./types";

export async function importImageFromPhoneGallery(): Promise<
  (ImageFileUri & ImageBase64Data & Partial<ImageDimensions>) | undefined
> {
  const {
    assets,
    didCancel,
    errorCode,
    errorMessage,
  } = await launchImageLibrary({
    mediaType: "photo",
    quality: 1,
    includeBase64: true,
  });
  if (didCancel) return;
  if (errorCode) {
    throw new Error(
      `Import from gallery error: ${[errorCode]}: ${errorMessage}`,
    );
  } else {
    const asset = assets && assets[0];
    if (!asset) {
      throw new Error(`Import from gallery error: asset undefined`);
    }
    const { base64, uri, width, height, type } = asset;
    const fullBase64 = `data:${type};base64, ${base64}`;
    if (uri) {
      return {
        width,
        height,
        imageFileUri: uri,
        imageBase64DataUri: fullBase64,
      };
    }
  }
}

export async function fetchImageBase64(imageUrl: string) {
  return fetch(imageUrl)
    .then(response => response.blob())
    .then(
      data =>
        new Promise<string | undefined>((resolve, reject) => {
          const reader = new FileReader(); // eslint-disable-line no-undef
          reader.onloadend = () => resolve(reader.result?.toString());
          reader.onerror = reject;
          reader.readAsDataURL(data);
        }),
    );
}

export async function loadImageBase64FromURI(
  fileUri: string,
  mimeType = "image/jpg",
) {
  const base64 = await readAsStringAsync(fileUri, {
    encoding: EncodingType.Base64,
  });
  const fullBase64 = `data:${mimeType};base64, ${base64}`;
  return fullBase64;
}

function getMimeTypeFromBase64(base64: string) {
  return base64.split(";")[0].slice(5);
}

type Options = {
  encoding: EncodingType.UTF8 | EncodingType.Base64;
};

export async function createFileAndWriteContent(
  parentUri: string,
  fileName: string,
  mimeType: string,
  contents: string,
  options: Options,
) {
  const fileUri = `${parentUri}/${fileName}`;
  await StorageAccessFramework.writeAsStringAsync(fileUri, contents, options);
  return fileUri;
}

export async function downloadImageToFile(imageUrl: string) {
  const fileId = uniqueId();
  const base64Image = await fetchImageBase64(imageUrl);
  if (!base64Image) throw new Error("no result from image base64 download");
  if (!cacheDirectory) throw new Error("no cache directory");
  const mimeType = getMimeTypeFromBase64(base64Image || "");
  const fileExtension = mimeType.split("/")[1];
  const fileName = `${fileId}.${fileExtension}`;
  const resultUri = await createFileAndWriteContent(
    cacheDirectory,
    fileName,
    mimeType,
    base64Image?.split(",")[1],
    {
      encoding: EncodingType.Base64,
    },
  );
  return resultUri;
}

export async function loadImageSizeAsync(
  url: string,
): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      url,
      (width, height) => {
        resolve({ width, height });
      },
      error => {
        reject(error);
      },
    );
  });
}

export function fitImageContain(
  imageDimensions: ImageDimensions,
  boxDimensions: ImageDimensions,
): { height: number; width: number } {
  const { height: imageHeight, width: imageWidth } = imageDimensions;
  const { height: boxHeight, width: boxWidth } = boxDimensions;
  if (imageHeight < boxHeight && imageWidth < boxWidth)
    return {
      width: imageWidth,
      height: imageHeight,
    };
  if (imageWidth / imageHeight >= boxWidth / boxHeight) {
    // width is the constraint
    return {
      width: boxWidth,
      height: (imageHeight / imageWidth) * boxWidth,
    };
  }
  // height is the constraint
  return {
    width: (imageWidth / imageHeight) * boxHeight,
    height: boxHeight,
  };
}