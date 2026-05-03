import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/auth/seed — Buat akun admin default jika belum ada
export async function GET() {
  try {
    await dbConnect();

    const adminEmail = 'admin@hicare.com';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Akun admin sudah ada',
        admin: { email: adminEmail, role: existing.role },
      });
    }

    const admin = await User.create({
      name: 'Admin HiCare',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Akun admin berhasil dibuat',
      admin: { email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat akun admin', detail: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
