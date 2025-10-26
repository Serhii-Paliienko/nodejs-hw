import createHttpError from 'http-errors';
import Note from '../models/Note.js';

export const getAllNotes = async (_req, res) => {
  const result = await Note.find();
  res.json(result);
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const result = await Note.findById(noteId);
  if (!result) {
    return next(createHttpError(404, 'Note not found'));
  }
  res.json(result);
};

export const createNote = async (req, res) => {
  const newNote = await Note.create(req.body);
  res.status(201).json(newNote);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const updatedNote = await Note.findByIdAndUpdate(noteId, req.body, {
    new: true,
  });
  if (!updatedNote) {
    return next(createHttpError(404, 'Note not found'));
  }
  res.json(updatedNote);
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const deletedNote = await Note.findByIdAndDelete(noteId);
  if (!deletedNote) {
    return next(createHttpError(404, 'Note not found'));
  }
  return res.status(200).json(deletedNote);
};
