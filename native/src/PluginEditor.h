#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

// Hosts the TypeScript UI (embedded via BinaryData from ../dist) in a JUCE
// WebView and bridges MIDI over the native-integration event channel:
//   UI -> native : "midiFromUI"  { bytes: [status, data1, data2] }
//   native -> UI : "midiToUI"    { bytes: [...] }
class MuseEditor : public juce::AudioProcessorEditor,
                   private juce::Timer
{
public:
    explicit MuseEditor (MuseProcessor&);
    void resized() override;

private:
    void timerCallback() override;
    static std::optional<juce::WebBrowserComponent::Resource> lookUpResource (const juce::String& url);

    MuseProcessor& museProcessor;
    juce::WebBrowserComponent web;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MuseEditor)
};
