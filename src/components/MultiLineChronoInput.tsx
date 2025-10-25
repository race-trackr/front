import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface MultiLineChronoInputProps {
  value?: string[] | null;
  onChange: (value: string[] | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const chronoRegex = /^(\d{1,2})\.(\d{2})\.(\d{3})$/; // MM.SS.mmm format

const MultiLineChronoInput: React.FC<MultiLineChronoInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => {
  const { t } = useTranslation();
  const chronos = value || [];

  const handleChronoChange = (index: number, newChrono: string) => {
    const newChronos = [...chronos];
    newChronos[index] = newChrono;
    onChange(newChronos);
  };

  const addChrono = () => {
    onChange([...chronos, '']);
  };

  const removeChrono = (index: number) => {
    const newChronos = chronos.filter((_, i) => i !== index);
    onChange(newChronos.length > 0 ? newChronos : null); // Set to null if empty
  };

  return (
    <div className={cn("space-y-2", className)}>
      {chronos.map((chrono, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={chrono}
            onChange={(e) => handleChronoChange(index, e.target.value)}
            placeholder={placeholder || t('enter_lap_time')}
            disabled={disabled}
            className={cn(
              !chronoRegex.test(chrono) && chrono !== '' && 'border-destructive focus-visible:ring-destructive'
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