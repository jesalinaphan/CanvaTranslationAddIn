import { Button, Rows, Text, Select, LoadingIndicator } from "@canva/app-ui-kit";
import { useState, useEffect } from "react";
import { useAddElement } from "utils/use_add_element";
import { useSelection } from "utils/use_selection_hook";
import * as styles from "styles/components.css";


export const App = () => {
  const [language, setLanguage] = useState("es");
  const [loading, setLoading] = useState(false);
  const addElement = useAddElement();
  const selection = useSelection("plaintext");

  const detectLanguage = async (text: string): Promise<string> => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=|`; 
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        "Language detection failed:",
        response.status,
        response.statusText
      );
      return "en"; 
    }
    const data = await response.json();
    return data.responseData.detectedLanguage || "en";
  };

  const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> => {
    console.log(`TStarting Translation`);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error("API request failed", response.status, response.statusText);
        const errorBody = await response.text();
        return text;
      }
      const data = await response.json();
      const translatedText = data.responseData.translatedText;
      return translatedText;
    } catch (error) {
      console.error("An error occurred while calling the translation API:", error);
      return text;
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const draft = await selection.read();
      for (const content of draft.contents) {
        const sourceLang = await detectLanguage(content.text);
        if (sourceLang !== language) {
          content.text = await translateText(
            content.text,
            sourceLang,
            language
          );
        }
      }
      await draft.save();
      console.log("Saved translated text");
    } catch (e) {
      console.error("An error occurred during the translation process:", e);
    }
    setLoading(false);
  };

  if (selection.count < 1) {
    return (
      <div className={styles.scrollContainer}>
        <Rows spacing="2u">
          <Text>Please select one or more text boxes to translate.</Text>
        </Rows>
      </div>
    );
  }

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Text>Choose a language to translate the selected text:</Text>
        <Select
          value={language}
          onChange={(value) => setLanguage(value)}
          options={[
            { value: "es", label: "Spanish" },
            { value: "fr", label: "French" },
            { value: "de", label: "German" },
            { value: "ja", label: "Japanese" },
            { value: "zh", label: "Chinese" },
            { value: "it", label: "Italian" },
            { value: "pt", label: "Portuguese" },
            { value: "ru", label: "Russian" },
            { value: "ar", label: "Arabic" },
            { value: "nl", label: "Dutch" },
            { value: "pl", label: "Polish" },
            { value: "en", label: "English" },
            { value: "tr", label: "Turkish" },
            { value: "sv", label: "Swedish" },
            { value: "no", label: "Norwegian" },
            { value: "da", label: "Danish" },
            { value: "fi", label: "Finnish" },
            { value: "el", label: "Greek" },
            
          ]}
          stretch
        />
        <Button
          variant="primary"
          onClick={handleTranslate}
          disabled={loading}
          stretch
        >
          {loading ? "Translating..." : "Translate Selection"}
        </Button>
      </Rows>
    </div>
  );
};
