import { Button } from "@/components/ui/button";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="space-y-2 text-center">
          <ChatBubbleLeftIcon className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Welkom bij Losser GPT</h1>
          <p className="text-muted-foreground">
            Begin een gesprek door een bericht te typen in het tekstveld hieronder.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Nieuwe Functies
          </h2>
          <ul className="space-y-4 text-muted-foreground">
            <li>• Chats worden 30 dagen bewaard, daarna wordt de oudste chat automatisch verwijderd</li>
            <li>• Gearchiveerde chats worden 90 dagen bewaard</li>
            <li>• Je kunt nu de titel van je chats aanpassen (maximaal 10 karakters)</li>
            <li>• Verbeterde weergave van chatberichten en laadstatus</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Richtlijnen
          </h2>
          <ul className="space-y-4 text-muted-foreground">
            <li>• Stel duidelijke en specifieke vragen voor de beste resultaten</li>
            <li>• De AI geeft informatie op basis van zijn training, maar kan fouten maken</li>
            <li>• Verifieer belangrijke informatie altijd via officiële bronnen</li>
            <li>• Deel geen gevoelige persoonlijke informatie in de chat</li>
          </ul>
        </div>
      </div>
    </div>
  );
}