const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

export const cloudinaryService = {
  async uploadFile(file: File): Promise<string> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      timestamp,
    };

    // 1. Get signature from the server
    const signatureResponse = await fetch("/api/sign-cloudinary-params", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paramsToSign }),
    });

    if (!signatureResponse.ok) {
      const errorText = await signatureResponse.text();
      throw new Error(
        `Failed to get upload signature: ${signatureResponse.status} ${errorText}`
      );
    }

    const { signature } = await signatureResponse.json();

    // 2. Upload file directly to Cloudinary with the signature
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", CLOUDINARY_API_KEY as string);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file: ${uploadResponse.status} ${errorText}`);
    }

    const result = await uploadResponse.json();
    return result.secure_url;
  },
};
