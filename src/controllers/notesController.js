import createHttpError from 'http-errors';
import Note from '../models/note.js';

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;

  const pageNum = Number(page);
  const perPageNum = Number(perPage);
  const filter = {};

  if (tag) {
    filter.tag = tag;
  }

  if (typeof search === 'string' && search.trim().length > 0) {
    filter.$text = { $search: search.trim() };
  }

  const totalNotes = await Note.countDocuments(filter);
  const notes = await Note.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * perPageNum)
    .limit(perPageNum);

  const totalPages = Math.ceil(totalNotes / perPageNum) || 1;

  return res.status(200).json({
    page: pageNum,
    perPage: perPageNum,
    totalNotes,
    totalPages,
    notes,
  });
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
