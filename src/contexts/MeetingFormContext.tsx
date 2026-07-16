import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface MeetingFormContextValue {
  isOpen: boolean;
  openMeetingForm: () => void;
  closeMeetingForm: () => void;
}

const MeetingFormContext = createContext<MeetingFormContextValue | null>(null);

export const MeetingFormProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openMeetingForm = useCallback(() => setIsOpen(true), []);
  const closeMeetingForm = useCallback(() => setIsOpen(false), []);

  return (
    <MeetingFormContext.Provider value={{ isOpen, openMeetingForm, closeMeetingForm }}>
      {children}
    </MeetingFormContext.Provider>
  );
};

export const useMeetingForm = () => {
  const ctx = useContext(MeetingFormContext);
  if (!ctx) throw new Error("useMeetingForm deve ser usado dentro de MeetingFormProvider");
  return ctx;
};
