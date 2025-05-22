# LangChain-Q-A

A full-stack Q&A chatbot built with React and Django, powered by LangChain and Hugging Face’s Meta-Llama-3-8B-Instruct model.

## Features

- Real-time chatbot interface
- LangChain-powered natural language processing
- Uses Meta-Llama-3-8B-Instruct from Hugging Face
- Simple and clean React-based UI
- Option to clear chat history

## Tech Stack

- **Frontend:** React
- **Backend:** Django + Django REST Framework
- **LLM Integration:** LangChain + Hugging Face (Meta-Llama-3-8B-Instruct)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/LangChain-Q-A.git
cd LangChain-Q-A
```

### 2. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder and add your Hugging Face token:

```
HUGGINGFACEHUB_API_TOKEN=your_token_here
```

Run the Django server:

```bash
python manage.py runserver
```

### 3. Frontend Setup (React)

```bash
cd ../frontend
npm install
npm start
```

The React app will open at `http://localhost:3000`.

## Folder Structure

```
LangChain-Q-A/
├── backend/       # Django backend with LangChain logic
├── frontend/      # React frontend for the chat UI
└── README.md
```

## License

This project is licensed under the MIT License.

## Credits

- [LangChain](https://www.langchain.com/)
- [Meta-Llama-3](https://huggingface.co/meta-llama)
- [Hugging Face](https://huggingface.co/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React](https://reactjs.org/)
