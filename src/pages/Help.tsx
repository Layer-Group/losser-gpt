import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Wat is Custom GPT?",
      answer: "Custom GPT is een AI-aangedreven chatinterface waarmee je gesprekken kunt voeren met een geavanceerd taalmodel. Het is ontworpen om je vragen te beantwoorden en te helpen bij verschillende taken."
    },
    {
      question: "Hoe start ik een nieuwe chat?",
      answer: "Klik op de 'Nieuwe chat +' knop in de zijbalk om een nieuw gesprek te starten. Je kunt meerdere chats tegelijk hebben en tussen ze wisselen via de zijbalk."
    },
    {
      question: "Wordt mijn gespreksgeschiedenis opgeslagen?",
      answer: "Ja, al je chatgesprekken worden opgeslagen en zijn toegankelijk via de zijbalk. Je kunt op elk moment terugkeren naar eerdere gesprekken."
    },
    {
      question: "Wat kan ik aan Custom GPT vragen?",
      answer: "Je kunt vragen stellen over een breed scala aan onderwerpen, om uitleg vragen, advies inwinnen of een algemeen gesprek voeren. De AI is ontworpen om behulpzaam te zijn binnen passende grenzen."
    },
    {
      question: "Hoe nauwkeurig zijn de antwoorden?",
      answer: "Hoewel de AI streeft naar accurate en behulpzame informatie, is het belangrijk om kritieke informatie te verifiëren bij gezaghebbende bronnen. De AI is een hulpmiddel, geen vervanging voor professioneel advies."
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
          Terug
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