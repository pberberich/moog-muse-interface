#include "PluginProcessor.h"
#include "PluginEditor.h"

MuseProcessor::MuseProcessor()
    : AudioProcessor (BusesProperties()
                          .withInput ("Input", juce::AudioChannelSet::stereo(), true)
                          .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
{
}

void MuseProcessor::prepareToPlay (double, int)
{
    if (wrapperType == wrapperType_Standalone && ! triedDirectOutput)
    {
        triedDirectOutput = true;
        auto devices = juce::MidiOutput::getAvailableDevices();
        for (const auto& d : devices)
            if (d.name.containsIgnoreCase ("muse"))
                directOutput = juce::MidiOutput::openDevice (d.identifier);
        if (directOutput == nullptr && ! devices.isEmpty())
            directOutput = juce::MidiOutput::openDevice (devices[0].identifier);
    }
}

bool MuseProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    return layouts.getMainOutputChannelSet() == juce::AudioChannelSet::stereo()
        && layouts.getMainInputChannelSet() == layouts.getMainOutputChannelSet();
}

void MuseProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    juce::ignoreUnused (buffer); // audio passes through untouched

    const juce::ScopedLock sl (queueLock);

    for (const auto metadata : midiMessages)
    {
        if (toUI.size() < 4096)
            toUI.push_back (metadata.getMessage());
    }

    for (const auto& m : toHost)
    {
        midiMessages.addEvent (m, 0);
        if (directOutput != nullptr)
            directOutput->sendMessageNow (m);
    }
    toHost.clear();
}

void MuseProcessor::queueMessageToHost (const juce::MidiMessage& message)
{
    const juce::ScopedLock sl (queueLock);
    if (toHost.size() < 4096)
        toHost.push_back (message);
}

std::vector<juce::MidiMessage> MuseProcessor::drainMessagesToUI()
{
    const juce::ScopedLock sl (queueLock);
    return std::exchange (toUI, {});
}

juce::AudioProcessorEditor* MuseProcessor::createEditor()
{
    return new MuseEditor (*this);
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new MuseProcessor();
}
