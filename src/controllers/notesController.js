import createHttpError from 'http-errors';
import Note from '../models/note.js';

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const userId = req.user._id;

  const pageNum = Number(page);
  const perPageNum = Number(perPage);
  const filter = { userId };

  if (tag) {
    filter.tag = tag;
  }

  if (typeof search === 'string' && search.trim().length > 0) {
    filter.$text = { $search: search.trim() };
  }

  const [totalNotes, notes] = await Promise.all([
    Note.countDocuments(filter),
    Note.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPageNum)
      .limit(perPageNum),
  ]);

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
  const result = await Note.findOne({ _id: noteId, userId: req.user._id });
  if (!result) {
    return next(createHttpError(404, 'Note not found'));
  }
  res.json(result);
};

export const createNote = async (req, res) => {
  const newNote = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json(newNote);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const updatedNote = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedNote) {
    return next(createHttpError(404, 'Note not found'));
  }
  res.json(updatedNote);
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const deletedNote = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });
  if (!deletedNote) {
    return next(createHttpError(404, 'Note not found'));
  }
  return res.status(200).json(deletedNote);
};
