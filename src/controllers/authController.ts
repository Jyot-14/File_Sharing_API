import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { User } from '../database/entities/User';
import { AppDataSource } from '../database/data-source';

dotenv.config();

const SECRET_KEY = 'secretkey456';

export async function signup(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Check if the email already exists in the database
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // If the email does not exist, create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    await userRepository.save(newUser);

    // Generate JWT token
    const token = jwt.sign({ email, username }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(201).json({ message: 'Signup successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Fetch user data from database using TypeORM
    const userData = await userRepository.findOne({ where: { username } });
    if (!userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Forgot and Reset Password
const transporter = nodemailer.createTransport({
  // Configure your email transporter
  service: 'gmail',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Check if the email exists in the database
    const existingUser = await userRepository.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Generate a password reset token
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

    // Compose the email with the password reset link
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Password Reset Link',
      html: `Your password reset token is: ${token}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset token sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token must be provided' });
    }

    // Verify the password reset token
    const decodedToken: any = jwt.verify(token, SECRET_KEY);

    const userRepository = AppDataSource.getRepository(User);

    //Update the user's password in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const userToUpdate = await userRepository.findOne({
      where: { email: decodedToken.email },
    });
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }
    userToUpdate.password = hashedPassword;
    await userRepository.save(userToUpdate);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
