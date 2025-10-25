import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ChronoEntry {
  lapTime: string;
  isBest: boolean;
}

interface MultiLineChronoInputProps {
  value?: ChronoEntry[] | null; // Changed type to ChronoEntry[]
  onChange: (value: ChronoEntry[] | null) => void; // Changed type to ChronoEntry[]
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const chronoRegex = /^(\d{1,2})\.(\d{2})\.(\d{3})$/;

const MultiLineChronoInput: React.FC<MultiLineChronoInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => {
  const { t } = useTranslation();
  const chronos = value || [];

  const handleChronoChange = (index: number, newLapTime: string) => {
    const newChronos = [...chronos];
    newChronos[index] = { lapTime: newLapTime, isBest: false }; // isBest defaults to false
    onChange(newChronos);
  };

  const addChrono = () => {
    onChange([...chronos, { lapTime: '', isBest: false }]); // Add new chrono as an object
  };

  const removeChrono = (index: number) => {
    const newChronos = chronos.filter((_, i) => i !== index);
    onChange(newChronos.length > 0 ? newChronos : null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {chronos.map((chronoEntry, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={chronoEntry.lapTime} // Access lapTime property
            onChange={(e) => handleChronoChange(index, e.target.value)}
            placeholder={placeholder || t('enter_lap_time')}
            disabled={disabled}
            className={cn(
              !chronoRegex.test(chronoEntry.lapTime) && chronoEntry.lapTime !== '' && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removeChrono(index)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('remove_lap_time')}</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addChrono}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" /> {t('add_lap_time')}
      </Button>
    </div>
  );
};

export default MultiLineChronoInput;