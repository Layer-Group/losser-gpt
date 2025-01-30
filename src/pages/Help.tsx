import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is Custom GPT?",
      answer: "Custom GPT is an AI-powered chat interface that allows you to have conversations with an advanced language model. It's designed to help answer your questions and assist with various tasks."
    },
    {
      question: "How do I start a new chat?",
      answer: "Click the 'New chat +' button in the sidebar to start a fresh conversation. You can have multiple chats running simultaneously and switch between them using the sidebar."
    },
    {
      question: "Is my conversation history saved?",
      answer: "Yes, all your chat conversations are saved and can be accessed from the sidebar. You can return to previous conversations at any time."
    },
    {
      question: "What can I ask Custom GPT?",
      answer: "You can ask questions about a wide range of topics, request explanations, seek advice, or engage in general conversation. The AI is designed to be helpful while maintaining appropriate boundaries."
    },
    {
      question: "How accurate are the responses?",
      answer: "While the AI strives to provide accurate and helpful information, it's important to verify critical information from authoritative sources. The AI is a tool to assist, not a replacement for professional advice."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Help & FAQ</h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">{faq.question}</h2>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;