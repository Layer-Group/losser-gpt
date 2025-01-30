import { AlertTriangle, Shield } from "lucide-react";

export const WelcomeScreen = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Custom GPT</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Guidelines
          </h2>
          <ul className="space-y-4">
            <li>• Verify responses for critical matters</li>
            <li>• Only share necessary confidential data</li>
            <li>• Provide feedback to improve accuracy</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Warnings
          </h2>
          <ul className="space-y-4">
            <li>• AI may occasionally generate incorrect information</li>
            <li>• Limited to pre-trained data</li>
            <li>• Verify important information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};