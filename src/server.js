import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lightstudy',
    password: '1',
    port: 5432,
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, role_id, specialty } = req.body; // Добавьте specialty

    try {
        const userExists = await pool.query(
            'SELECT * FROM public.users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const newUser = await pool.query(
            'INSERT INTO public.users (name, email, password, role_id, specialty) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, password, role_id, specialty]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query(
            'SELECT * FROM public.users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        res.status(200).json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/mentors', async (req, res) => {
    try {
        const mentors = await pool.query(
            'SELECT * FROM public.users WHERE role_id = 1'
        );
        res.status(200).json(mentors.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/chats', async (req, res) => {
    const { user_id } = req.query;

    try {
        const chats = await pool.query(`
            SELECT c.chat_id, cp.user_id as participant_id, u.name as participant_name, 
                   u.avatar as participant_avatar, m.content as last_message,
                   m.sent_at as last_message_time
            FROM public.chats c
            JOIN public.chat_participants cp ON c.chat_id = cp.chat_id
            JOIN public.users u ON cp.user_id = u.user_id
            LEFT JOIN (
                SELECT chat_id, content, sent_at
                FROM public.messages
                WHERE (chat_id, sent_at) IN (
                    SELECT chat_id, MAX(sent_at)
                    FROM public.messages
                    GROUP BY chat_id
                )
            ) m ON c.chat_id = m.chat_id
            WHERE c.chat_id IN (
                SELECT chat_id FROM public.chat_participants WHERE user_id = $1
            ) AND cp.user_id != $1
            ORDER BY m.sent_at DESC
        `, [user_id]);

        res.status(200).json(chats.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/messages', async (req, res) => {
    const { chat_id } = req.query;

    try {
        const messages = await pool.query(`
            SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
            FROM public.messages m
            JOIN public.users u ON m.sender_id = u.user_id
            WHERE m.chat_id = $1
            ORDER BY m.sent_at ASC
        `, [chat_id]);

        await pool.query(`
            UPDATE public.messages
            SET is_read = TRUE
            WHERE chat_id = $1 AND is_read = FALSE
        `, [chat_id]);

        res.status(200).json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/messages', async (req, res) => {
    const { chat_id, sender_id, content } = req.body;

    try {
        const newMessage = await pool.query(`
            INSERT INTO public.messages (chat_id, sender_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [chat_id, sender_id, content]);

        await pool.query(`
            UPDATE public.chats
            SET updated_at = NOW()
            WHERE chat_id = $1
        `, [chat_id]);

        res.status(201).json(newMessage.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/chats', async (req, res) => {
    console.log("Request body:", req.body); // Добавьте лог

    const { user_id, participant_id } = req.body;

    // Улучшенная валидация
    if (!user_id || !participant_id || isNaN(user_id) || isNaN(participant_id)) {
        console.error("Validation failed - user_id:", user_id, "participant_id:", participant_id);
        return res.status(400).json({ error: 'Не указаны user_id или participant_id' });
    }

    try {
        // Начинаем транзакцию
        await pool.query('BEGIN');

        // 1. Создаем чат
        const newChat = await pool.query(
            'INSERT INTO public.chats DEFAULT VALUES RETURNING chat_id'
        );
        const chatId = newChat.rows[0].chat_id;
        console.log("Created chat with ID:", chatId);

        // 2. Добавляем участников
        await pool.query(
            'INSERT INTO public.chat_participants (chat_id, user_id) VALUES ($1, $2)',
            [chatId, user_id]
        );
        console.log("Added participant 1:", user_id);

        await pool.query(
            'INSERT INTO public.chat_participants (chat_id, user_id) VALUES ($1, $2)',
            [chatId, participant_id]
        );
        console.log("Added participant 2:", participant_id);

        // Завершаем транзакцию
        await pool.query('COMMIT');

        res.status(201).json({
            chat_id: chatId,
            message: 'Чат успешно создан'
        });

    } catch (err) {
        // Откатываем транзакцию в случае ошибки
        await pool.query('ROLLBACK');
        console.error('Ошибка при создании чата:', err.stack); // Более детальный лог ошибки

        res.status(500).json({
            error: 'Ошибка сервера при создании чата',
            details: err.message
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});