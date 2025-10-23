"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoFormSetup() {
  const router = useRouter();

  useEffect(() => {
    // Create a simple demo form for testing video AI
    const demoForm = {
      name: "AI Vision Test Form",
      description: "Test the AI video form filler with this simple inspection checklist",
      fields: [
        {
          id: "field_1",
          type: "radio",
          name: "people_present",
          label: "Are people visible in the frame?",
          placeholder: "",
          required: true,
          options: ["Yes", "No"],
          color: "#c4dfc4",
        },
        {
          id: "field_2",
          type: "text",
          name: "visible_objects",
          label: "What objects do you see?",
          placeholder: "Describe what's visible",
          required: false,
          color: "#c4dfc4",
        },
        {
          id: "field_3",
          type: "thumbs",
          name: "good_lighting",
          label: "Is there good lighting?",
          placeholder: "",
          required: false,
          color: "#c8e0f5",
        },
        {
          id: "field_4",
          type: "radio",
          name: "safety_equipment",
          label: "Is safety equipment visible?",
          placeholder: "",
          required: false,
          options: ["Yes", "No", "N/A"],
          color: "#c8e0f5",
        },
        {
          id: "field_5",
          type: "number",
          name: "item_count",
          label: "How many items can you count?",
          placeholder: "Enter a number",
          required: false,
          color: "#ddc8f5",
        },
      ],
      submitButtonText: "Submit Inspection",
    };

    // Save to localStorage
    localStorage.setItem("formPreviewData", JSON.stringify(demoForm));

    // Redirect to preview page after a brief moment
    setTimeout(() => {
      router.push("/preview");
    }, 500);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#c4dfc4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">Creating demo form...</p>
        <p className="text-gray-500 text-sm mt-2">Redirecting to preview...</p>
      </div>
    </div>
  );
}

