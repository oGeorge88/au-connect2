// src/app/api/contacts/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/app/utils/dbConnect';
import Contact from '@/app/models/Contact';
import fs from 'fs';
import path from 'path';


// GET: Fetch all contacts
export async function GET() {
  try {
    await dbConnect();
    const contacts = await Contact.find(); // Fetch all contacts
    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ message: 'Failed to fetch contacts', error }, { status: 500 });
  }
}

// POST: Add a new contact
export async function POST(req) {
  try {
    await dbConnect();
    
    const formData = await req.formData();
    const name = formData.get('name');
    const faculty = formData.get('faculty');
    const role = formData.get('role');
    const department = formData.get('department');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const facebook = formData.get('facebook');
    const line = formData.get('line');
    const profilePicture = formData.get('profilePicture');

    if (!name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let profilePicturePath = null;

    if (profilePicture && profilePicture.size > 0) {
      const profilePictureName = `${Date.now()}-${profilePicture.name}`;
      const filePath = path.join(uploadDir, profilePictureName);
      const fileBuffer = Buffer.from(await profilePicture.arrayBuffer());
      fs.writeFileSync(filePath, fileBuffer);
      profilePicturePath = `${profilePictureName}`;
    }

    const newContact = new Contact({
      name,
      faculty,
      role,
      department,
      email,
      phone,
      facebook,
      line,
      profilePicture: profilePicturePath,
    });

    await newContact.save();
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ message: 'Failed to create contact', error }, { status: 500 });
  }
}
