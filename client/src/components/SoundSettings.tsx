import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Volume2, VolumeX, Bell, CheckCircle, AlertCircle, MousePointer, Zap } from "lucide-react";
import { getSoundSettings, updateSoundSettings, updateIndividualSound, playSound } from "@/lib/sounds";

interface SoundSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SoundSettingsDialog({ open, onOpenChange }: SoundSettingsDialogProps) {
  const [settings, setSettings] = useState(getSoundSettings());

  useEffect(() => {
    if (open) {
      setSettings(getSoundSettings());
    }
  }, [open]);

  const handleMasterToggle = (enabled: boolean) => {
    updateSoundSettings({ enabled });
    setSettings(prev => ({ ...prev, enabled }));
  };

  const handleVolumeChange = (value: number[]) => {
    const volume = value[0];
    updateSoundSettings({ volume });
    setSettings(prev => ({ ...prev, volume }));
  };

  const handleSoundToggle = (soundType: keyof typeof settings.sounds, enabled: boolean) => {
    updateIndividualSound(soundType, enabled);
    setSettings(prev => ({ ...prev, sounds: { ...prev.sounds, [soundType]: enabled } }));
  };

  const testSound = (type: 'success' | 'notification' | 'error' | 'click' | 'distribute') => {
    const wasEnabled = settings.sounds[type];
    if (!wasEnabled) {
      updateIndividualSound(type, true);
    }
    playSound(type);
    if (!wasEnabled) {
      updateIndividualSound(type, false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Sound Settings
          </DialogTitle>
          <DialogDescription>
            Customize sound effects for different application events.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-white text-sm font-medium">Master Sound</Label>
                <p className="text-xs text-muted-foreground">Enable or disable all sounds</p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleMasterToggle}
              data-testid="switch-master-sound"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Volume</Label>
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[settings.volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                disabled={!settings.enabled}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-right">{Math.round(settings.volume * 100)}%</p>
          </div>

          <div className="space-y-3">
            <Label className="text-white text-sm font-medium">Event Sounds</Label>
            
            <SoundToggleRow
              icon={<CheckCircle className="h-4 w-4 text-primary" />}
              label="Success"
              description="Transaction completed"
              enabled={settings.sounds.success}
              masterEnabled={settings.enabled}
              onToggle={(v) => handleSoundToggle('success', v)}
              onTest={() => testSound('success')}
            />

            <SoundToggleRow
              icon={<Bell className="h-4 w-4 text-secondary" />}
              label="Notification"
              description="Alerts and updates"
              enabled={settings.sounds.notification}
              masterEnabled={settings.enabled}
              onToggle={(v) => handleSoundToggle('notification', v)}
              onTest={() => testSound('notification')}
            />

            <SoundToggleRow
              icon={<AlertCircle className="h-4 w-4 text-destructive" />}
              label="Error"
              description="Failed actions"
              enabled={settings.sounds.error}
              masterEnabled={settings.enabled}
              onToggle={(v) => handleSoundToggle('error', v)}
              onTest={() => testSound('error')}
            />

            <SoundToggleRow
              icon={<MousePointer className="h-4 w-4 text-blue-400" />}
              label="Click"
              description="Button interactions"
              enabled={settings.sounds.click}
              masterEnabled={settings.enabled}
              onToggle={(v) => handleSoundToggle('click', v)}
              onTest={() => testSound('click')}
            />

            <SoundToggleRow
              icon={<Zap className="h-4 w-4 text-yellow-400" />}
              label="Distribute"
              description="Distribution events"
              enabled={settings.sounds.distribute}
              masterEnabled={settings.enabled}
              onToggle={(v) => handleSoundToggle('distribute', v)}
              onTest={() => testSound('distribute')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SoundToggleRow({ 
  icon, 
  label, 
  description, 
  enabled, 
  masterEnabled,
  onToggle, 
  onTest 
}: { 
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  masterEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onTest: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-white/5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onTest}
          disabled={!masterEnabled}
          className="h-7 px-2 text-xs"
        >
          Test
        </Button>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={!masterEnabled}
        />
      </div>
    </div>
  );
}
