const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Configure Email Transporter
console.log(`Attempting to connect as: ${process.env.SMTP_USER}`);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email Server Connection Error:', error);
        console.log('HINT: For Gmail, ensure you are using an App Password (2FA enables) and NOT your login password.');
        console.log('Ensure "Less secure app access" is not the issue (Google deprecated it, App Passwords are required).');
    } else {
        console.log(`Email Server is ready to take messages from ${process.env.EMAIL_USER}`);
    }
});

app.post('/api/generate', async (req, res) => {
    try {
        const { idea } = req.body;
        if (!idea) return res.status(400).json({ error: 'Idea is required' });

        const prompt = `
        Act as an expert Product Manager and Tech Lead. 
        I have a product idea: "${idea}".
        
        Generate a detailed JSON response with the following fields:
        1. "overview": A compelling overview of the project.
        2. "existing_solutions": What already exists in the market.
        3. "unique_selling_point": What makes this unique.
        4. "best_practices": How to make it the best (technical & UX).
        5. "implementation_steps": Step-by-step existing technical plan (frontend, backend, db, deployment).
        6. "timeline_days": Estimated number of days to build MVP.
        7. "pitch_content": A short, punchy pitch to showcase the work.
        8. "tasks": A list of specific tasks that can be split among teammates.
        
        Return ONLY valid JSON.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content);
        res.json(content);

    } catch (error) {
        console.error('Groq API Error:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});

app.post('/api/send-assignments', async (req, res) => {
    try {
        const { assignments, projectTitle } = req.body;
        // assignments: [{ name, email, task }]

        if (!assignments || !Array.isArray(assignments)) {
            return res.status(400).json({ error: 'Invalid assignments data' });
        }

        const results = [];

        // Create fresh transporter for this request
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        for (const person of assignments) {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: person.email,
                subject: `New Task Assignment: ${projectTitle || 'MVP Project'}`,
                text: `Hi ${person.name},\n\nYou have been assigned a new task for the project "${projectTitle || 'MVP Project'}"!\n\nTASK:\n${person.task}\n\nLet's get this done!\n\nBest,\nYour MVP Generator Bot`
            };

            try {
                await transporter.sendMail(mailOptions);
                results.push({ email: person.email, status: 'sent' });
            } catch (err) {
                console.error(`Failed to send to ${person.email}`, err);
                results.push({ email: person.email, status: 'failed', error: err.message });
            }
        }

        res.json({ message: 'Process complete', results });

    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
