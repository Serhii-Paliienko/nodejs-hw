import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';

const noteRoutes = Router();

noteRoutes.get('/notes', getAllNotes);
noteRoutes.get('/notes/:noteId', getNoteById);
noteRoutes.post('/notes', createNote);
noteRoutes.patch('/notes/:noteId', updateNote);
noteRoutes.delete('/notes/:noteId', deleteNote);

export default noteRoutes;
