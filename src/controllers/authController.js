import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import Session from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

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
