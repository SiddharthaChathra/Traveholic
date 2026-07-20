import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('media');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const formDataEntryValue of files) {
      if (typeof formDataEntryValue === 'string') {
        continue;
      }
      
      const file = formDataEntryValue as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize filename and add timestamp
      const originalName = file.name;
      const extension = originalName.split('.').pop() || '';
      const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}_${safeName}`;
      
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      uploadedFiles.push({
        url: `/uploads/${fileName}`,
        originalName: originalName,
        size: file.size,
        mimetype: file.type
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    });
    
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error occurred during upload' },
      { status: 500 }
    );
  }
}
