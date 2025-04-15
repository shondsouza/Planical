import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
DATA_PATH = os.getenv("DATA_PATH", "./data")

# Flag to use mock responses (when API key is missing)
USE_MOCK_RESPONSES = not GROQ_API_KEY or GROQ_API_KEY == "mock-api-key-for-testing"

# Only import and initialize LLM-related components if we're not using mock responses
if not USE_MOCK_RESPONSES:
    try:
        from langchain_groq import ChatGroq
        from langchain_huggingface import HuggingFaceEmbeddings
        from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
        from langchain_chroma import Chroma
        from langchain.chains import RetrievalQA
        from langchain.prompts import PromptTemplate
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        
        # Initialize LLM
        def initialize_llm():
            return ChatGroq(
                temperature=0,
                groq_api_key=GROQ_API_KEY,
                model_name="llama-3.3-70b-versatile"
            )

        # Create or load vector database
        def create_vector_db():
            if not os.path.exists(DATA_PATH):
                os.makedirs(DATA_PATH)

            loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
            documents = loader.load()
            
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            texts = text_splitter.split_documents(documents)
            
            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            vector_db = Chroma.from_documents(texts, embeddings, persist_directory=CHROMA_DB_PATH)
            vector_db.persist()
            
            print("✅ ChromaDB created and data saved")
            return vector_db

        # Initialize database
        if not os.path.exists(CHROMA_DB_PATH):
            vector_db = create_vector_db()
        else:
            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            vector_db = Chroma(persist_directory=CHROMA_DB_PATH, embedding_function=embeddings)

        # Setup QA chain
        def setup_qa_chain(vector_db, llm):
            retriever = vector_db.as_retriever()
            
            prompt_template = """
            You are a compassionate mental health chatbot powered by Planical AI. Respond thoughtfully to the following question:
            {context}

            User: {question}
            Chatbot:
            """
            
            PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
            
            return RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=retriever,
                chain_type_kwargs={"prompt": PROMPT}
            )

        # Initialize LLM and chain
        llm = initialize_llm()
        qa_chain = setup_qa_chain(vector_db, llm)
    except Exception as e:
        print(f"Error initializing LLM components: {str(e)}")
        USE_MOCK_RESPONSES = True

# FastAPI app setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],  # Flask default ports
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    if USE_MOCK_RESPONSES:
        # Return mock responses for testing
        return {"response": f"This is a mock response from Planical AI. You asked: '{request.message}'. In a real deployment, this would be answered by our AI model."}
    else:
        # Use the actual LLM for responses
        response = qa_chain.run(request.message)
        return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
