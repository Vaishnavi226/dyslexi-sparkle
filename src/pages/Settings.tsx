import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Upload, RotateCcw, Save, Volume2, Eye, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { SpeechUtils } from '@/utils/speechUtils';

const Settings: React.FC = () => {
  const { userProfile, updateProfile } = useGame();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleSave = () => {
    updateProfile(tempProfile);
    toast({
      title: "Settings Saved! ✅",
      description: "Your preferences have been updated.",
    });
  };

  const handleReset = () => {
    setTempProfile(userProfile);
    toast({
      title: "Settings Reset",
      description: "All changes have been reverted.",
    });
  };

  const handleTestTTS = () => {
    SpeechUtils.speak("Hello! This is a test of the text-to-speech feature.", {
      rate: tempProfile.ttsRate,
      volume: tempProfile.ttsVolume
    });
  };

  const exportData = () => {
    const data = {
      profile: userProfile,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dyslexia-support-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported! 📦",
      description: "Your data has been downloaded as a JSON file.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profile) {
          updateProfile(data.profile);
          setTempProfile(data.profile);
          toast({
            title: "Data Imported! 📥",
            description: "Your settings have been restored.",
          });
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "The file format is not valid.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SettingsIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Accessibility Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Accessibility Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font">Preferred Font</Label>
                    <Select
                      value={tempProfile.preferredFont}
                      onValueChange={(value: 'default' | 'opendyslexic' | 'atkinson') =>
                        setTempProfile({ ...tempProfile, preferredFont: value })
                      }
                    >
                      <SelectTrigger id="font" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Font</SelectItem>
                        <SelectItem value="opendyslexic">OpenDyslexic (Dyslexia-friendly)</SelectItem>
                        <SelectItem value="atkinson">Atkinson Hyperlegible</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose a font that's easier for you to read
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select
                      value={tempProfile.fontSize}
                      onValueChange={(value: 'small' | 'medium' | 'large') =>
                        setTempProfile({ ...tempProfile, fontSize: value })
                      }
                    >
                      <SelectTrigger id="fontSize" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Color and Contrast */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="contrast">High Contrast Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Increases contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      id="contrast"
                      checked={tempProfile.highContrast}
                      onCheckedChange={(checked) =>
                        setTempProfile({ ...tempProfile, highContrast: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <p className="text-xs text-muted-foreground">
                        Current: {theme === 'light' ? 'Light' : 'Dark'} mode
                      </p>
                    </div>
                    <Button onClick={toggleTheme} variant="outline" size="sm">
                      <Palette className="w-4 h-4 mr-2" />
                      Toggle Theme
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Audio Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Audio Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text-to-Speech */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="tts">Text-to-Speech</Label>
                      <p className="text-xs text-muted-foreground">
                        Have text read aloud to you
                      </p>
                    </div>
                    <Switch
                      id="tts"
                      checked={tempProfile.ttsEnabled}
                      onCheckedChange={(checked) =>
                        setTempProfile({ ...tempProfile, ttsEnabled: checked })
                      }
                    />
                  </div>

                  {tempProfile.ttsEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pl-4 border-l-2 border-primary/20"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Speech Rate</Label>
                          <span className="text-sm text-muted-foreground">
                            {tempProfile.ttsRate}x
                          </span>
                        </div>
                        <Slider
                          value={[tempProfile.ttsRate]}
                          onValueChange={(value) =>
                            setTempProfile({ ...tempProfile, ttsRate: value[0] })
                          }
                          max={2}
                          min={0.5}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Slow</span>
                          <span>Fast</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Speech Volume</Label>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(tempProfile.ttsVolume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[tempProfile.ttsVolume]}
                          onValueChange={(value) =>
                            setTempProfile({ ...tempProfile, ttsVolume: value[0] })
                          }
                          max={1}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <Button onClick={handleTestTTS} variant="outline" size="sm">
                        <Volume2 className="w-4 h-4 mr-2" />
                        Test Speech
                      </Button>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Sound Effects */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="soundfx">Sound Effects</Label>
                    <p className="text-xs text-muted-foreground">
                      Play sounds for actions and achievements
                    </p>
                  </div>
                  <Switch
                    id="soundfx"
                    checked={tempProfile.soundFxEnabled}
                    onCheckedChange={(checked) =>
                      setTempProfile({ ...tempProfile, soundFxEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export your progress data or import previously saved data.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={exportData} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                      id="importFile"
                    />
                    <Button asChild variant="outline" className="w-full">
                      <label htmlFor="importFile" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Data Privacy</h4>
                  <p className="text-sm text-muted-foreground">
                    All your data is stored locally on your device. We don't collect or share any personal information.
                    You can export your data at any time and delete it from your browser's storage settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;