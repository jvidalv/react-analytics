import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { uuidv7 } from "uuidv7";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing file or type" },
        { status: 400 },
      );
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Process image based on type
    let processedBuffer = fileBuffer;
    const fileExt = ".jpg";

    if (type === "avatar") {
      processedBuffer = await sharp(fileBuffer)
        .resize(512, 512, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Ensure file size is under 1MB
      if (processedBuffer.length > 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large after processing" },
          { status: 400 },
        );
      }
    }

    if (type === "simulator-screenshot") {
      processedBuffer = await sharp(fileBuffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      // Ensure file size is under 2MB
      if (processedBuffer.length > 1024 * 1024 * 2) {
        return NextResponse.json(
          { error: "File too large after processing" },
          { status: 400 },
        );
      }
    }

    // Generate a UUIDv7 for a unique filename
    const fileName = `${type}/${uuidv7()}${fileExt}`;

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: processedBuffer,
        ContentType: "image/jpeg",
      }),
    );

    // Return the final public URL
    const finalUrl = `${process.env.S3_BUCKET_URL}/${fileName}`;
    return NextResponse.json({ url: finalUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
};
