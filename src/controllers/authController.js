import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import Session from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { sendMail } from '../utils/sendMail.js';

export const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return next(createHttpError(400, 'Email in use'));

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  return res.status(201).json(user);
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(createHttpError(401, 'Invalid credentials'));

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return next(createHttpError(401, 'Invalid credentials'));

  await Session.deleteMany({ userId: user._id });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  return res.status(200).json(user);
};

export const refreshUserSession = async (req, res, next) => {
  const { sessionId, refreshToken } = req.cookies || {};
  if (!sessionId || !refreshToken) {
    return next(createHttpError(401, 'Session not found'));
  }

  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session) return next(createHttpError(401, 'Session not found'));

  if (session.refreshTokenValidUntil.getTime() <= Date.now()) {
    await Session.deleteOne({ _id: session._id });
    return next(createHttpError(401, 'Session token expired'));
  }

  await Session.deleteOne({ _id: session._id });
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  return res.status(200).json({ message: 'Session refreshed' });
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies || {};
  if (sessionId) {
    await Session.deleteOne({
      _id: sessionId,
    });
  }
  const opts = { httpOnly: true, secure: true, sameSite: 'none' };
  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', opts);
  res.clearCookie('sessionId', opts);
  return res.status(204).end();
};

export const requestResetEmail = async (req, res, next) => {
  const email = req.body?.email;
  if (!email) return next(createHttpError(400, 'Email is required'));

  const user = await User.findOne({ email });
  const NEUTRAL = { message: 'Password reset email sent successfully' };
  if (!user) return res.status(200).json(NEUTRAL);

  const resetToken = jwt.sign(
    { sub: String(user._id), email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  try {
    const templatePath = path.resolve(
      'src/templates/reset-password-email.html',
    );
    const source = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);
    const html = template({
      name: user.username || user.email,
      link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
    });

    await sendMail({ to: email, subject: 'Reset your password', html });
  } catch {
    return next(
      createHttpError(500, 'Failed to send the email, please try again later.'),
    );
  }

  return res.status(200).json(NEUTRAL);
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) return next(createHttpError(404, 'User not found'));

  const hashed = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashed });

  await Session.deleteMany({ userId: user._id });

  return res.status(200).json({ message: 'Password reset successfully' });
};
