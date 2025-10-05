import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const languages = [
    { code: "EN", name: "English" },
    { code: "VI", name: "Tiếng Việt" },
    { code: "KO", name: "한국어 (Korean)" },
    { code: "ZH", name: "中文 (Chinese)" },
    { code: "JA", name: "日本語 (Japanese)" },
    { code: "RU", name: "Русский (Russian)" },
    { code: "ES", name: "Español (Spanish)" },
    { code: "DE", name: "Deutsch (German)" },
    { code: "FR", name: "Français (French)" },
    { code: "TL", name: "Filipino (Tagalog)" },
    { code: "TH", name: "ไทย (Thai)" },
    { code: "ID", name: "Bahasa Indonesia" },
];

interface LanguageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LanguageSettingsModal = ({ open, onOpenChange }: LanguageSettingsModalProps) => {
    const { user, profile } = useAuth();
    const [selectedLanguage, setSelectedLanguage] = useState(profile?.language || 'EN');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setSelectedLanguage(profile.language);
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ language: selectedLanguage })
                .eq('id', user.id);
            if (error) throw error;
            toast.success("Language preference saved.");
            onOpenChange(false);
            // Note: A full i18n implementation would require refreshing the app state here.
        } catch (error: any) {
            toast.error(`Failed to save: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Select Language</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-2 py-4">
            {languages.map(lang => (
                <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedLanguage(lang.code)}
                >
                    {lang.name}
                </Button>
            ))}
        </div>
        <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Preference"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSettingsModal;