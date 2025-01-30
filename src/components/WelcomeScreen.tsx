import { AlertTriangle, Shield, Bell } from "lucide-react";

export const WelcomeScreen = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Welkom bij Custom GPT</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Nieuwe Functies
          </h2>
          <ul className="space-y-4">
            <li>• Chats worden 30 dagen bewaard, daarna wordt de oudste chat automatisch verwijderd</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Richtlijnen
          </h2>
          <ul className="space-y-4">
            <li>• Verifieer antwoorden voor kritieke zaken</li>
            <li>• Deel alleen noodzakelijke vertrouwelijke gegevens</li>
            <li>• Geef feedback om nauwkeurigheid te verbeteren</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Waarschuwingen
          </h2>
          <ul className="space-y-4">
            <li>• AI kan soms onjuiste informatie genereren</li>
            <li>• Beperkt tot vooraf getrainde data</li>
            <li>• Verifieer belangrijke informatie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};