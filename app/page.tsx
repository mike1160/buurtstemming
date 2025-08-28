'use client';

import { useState } from 'react';

interface Vote {
  houseNumber: number;
  timestamp: string;
  option: 'struiken' | 'gras' | 'onthouding';
}

interface VoteCounts {
  struiken: Vote[];
  gras: Vote[];
  onthouding: Vote[];
}

export default function BuurtstemmingPage() {
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [votes, setVotes] = useState<VoteCounts>({
    struiken: [],
    gras: [],
    onthouding: []
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Geldige huisnummers (specifiek alleen deze oneven nummers)
  const validHouseNumbers = [101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133];

  const isValidHouseNumber = (number: string): boolean => {
    return validHouseNumbers.includes(parseInt(number));
  };

  const hasAlreadyVoted = (houseNumber: string): boolean => {
    return Object.values(votes).some(voteList => 
      voteList.some(vote => vote.houseNumber === parseInt(houseNumber))
    );
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    if (type === 'success') {
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const submitVote = () => {
    // Validation
    if (!houseNumber) {
      showMessage('Voer je huisnummer in', 'error');
      return;
    }

    if (!isValidHouseNumber(houseNumber)) {
      showMessage('Dit huisnummer mag niet stemmen (alleen: 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133)', 'error');
      return;
    }

    if (hasAlreadyVoted(houseNumber)) {
      showMessage('Dit huisnummer heeft al gestemd!', 'error');
      return;
    }

    if (!selectedOption) {
      showMessage('Kies een optie om op te stemmen', 'error');
      return;
    }

    // Add vote
    const voteData: Vote = {
      houseNumber: parseInt(houseNumber),
      timestamp: new Date().toISOString(),
      option: selectedOption as 'struiken' | 'gras' | 'onthouding'
    };

    setVotes(prev => ({
      ...prev,
      [selectedOption]: [...prev[selectedOption as keyof VoteCounts], voteData]
    }));
    
    showMessage('Je stem is succesvol uitgebracht! 🎉', 'success');
    
    // Reset form
    setHouseNumber('');
    setSelectedOption('');
  };

  const generateResultsText = (): string => {
    const totalVotes = Object.values(votes).reduce((sum, voteList) => sum + voteList.length, 0);
    const date = new Date().toLocaleDateString('nl-NL');
    
    let text = `🌿 BUURTSTEMMING RESULTATEN 🌿\n`;
    text += `Datum: ${date}\n`;
    text += `Onderwerp: Laten we de struiken staan of willen we ons gras terug?\n\n`;
    text += `📊 UITSLAG:\n`;
    
    Object.keys(votes).forEach(option => {
      const count = votes[option as keyof VoteCounts].length;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      const emoji = option === 'struiken' ? '🌳' : option === 'gras' ? '🌱' : '🤷‍♀️';
      const label = option === 'struiken' ? 'Struiken laten staan' : option === 'gras' ? 'Gras terug' : 'Onthouding';
      
      text += `${emoji} ${label}: ${count} stemmen (${percentage}%)\n`;
    });
    
    text += `\nTotaal aantal stemmen: ${totalVotes}\n`;
    text += `Deelgenomen huisnummers: ${Object.values(votes).flat().map(vote => vote.houseNumber).sort((a, b) => a - b).join(', ')}\n\n`;
    text += `Deze stemming is transparant uitgevoerd met alle buurtbewoners van huisnummers: 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133.`;
    
    return text;
  };

  const exportToEmail = () => {
    const results = generateResultsText();
    const subject = 'Buurtstemming Resultaten: Struiken laten staan of gras terug?';
    const body = encodeURIComponent(results);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const exportToWhatsApp = () => {
    const results = generateResultsText();
    const encodedText = encodeURIComponent(results);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const totalVotes = Object.values(votes).reduce((sum, voteList) => sum + voteList.length, 0);
  const allVoters = Object.values(votes).flat().map(vote => vote.houseNumber).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">🌿 Buurtstemming</h1>
          <p className="text-lg opacity-90">Laten we de struiken staan of willen we ons gras terug?</p>
        </div>

        {/* Voting Section */}
        <div className="p-8">
          <div className="mb-8">
            <div className="mb-6">
              <label htmlFor="huisnummer" className="block mb-2 font-semibold text-gray-700">
                Jouw huisnummer:
              </label>
              <input
                type="number"
                id="huisnummer"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Voer je huisnummer in (101, 103, 105, 107...133)"
                min="101"
                max="133"
                className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-4 mb-6">
              <div 
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedOption === 'struiken' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOption('struiken')}
              >
                <input
                  type="radio"
                  name="vote"
                  value="struiken"
                  checked={selectedOption === 'struiken'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mr-4 transform scale-125"
                />
                <span className="text-2xl mr-3">🌳</span>
                <label className="cursor-pointer">Struiken laten staan - Behouden van het huidige groen</label>
              </div>

              <div 
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedOption === 'gras' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOption('gras')}
              >
                <input
                  type="radio"
                  name="vote"
                  value="gras"
                  checked={selectedOption === 'gras'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mr-4 transform scale-125"
                />
                <span className="text-2xl mr-3">🌱</span>
                <label className="cursor-pointer">Gras terug - Terugkeer naar het oorspronkelijke gras</label>
              </div>

              <div 
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedOption === 'onthouding' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOption('onthouding')}
              >
                <input
                  type="radio"
                  name="vote"
                  value="onthouding"
                  checked={selectedOption === 'onthouding'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mr-4 transform scale-125"
                />
                <span className="text-2xl mr-3">🤷‍♀️</span>
                <label className="cursor-pointer">Geen mening / Onthouding</label>
              </div>
            </div>

            <button
              onClick={submitVote}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-200 shadow-lg"
            >
              Stem Uitbrengen
            </button>

            {message.text && (
              <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gray-50 p-8 border-t-2 border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">📊 Live Resultaten</h2>
          
          {Object.keys(votes).map((option) => {
            const count = votes[option as keyof VoteCounts].length;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const emoji = option === 'struiken' ? '🌳' : option === 'gras' ? '🌱' : '🤷‍♀️';
            const label = option === 'struiken' ? 'Struiken laten staan' : option === 'gras' ? 'Gras terug' : 'Onthouding';
            const bgColor = option === 'struiken' ? 'bg-green-500' : option === 'gras' ? 'bg-blue-500' : 'bg-orange-500';
            
            return (
              <div key={option} className="mb-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{emoji} {label}</span>
                  <span className="text-sm text-gray-600">{count} stemmen ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${bgColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          <div className="text-center mt-6 font-bold text-gray-800">
            Totaal aantal stemmen: {totalVotes}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <strong>Deelgenomen huisnummers:</strong>
            <div className="mt-1">
              {allVoters.length > 0 ? allVoters.join(', ') : 'Nog geen stemmen'}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="p-6 text-center border-t-2 border-gray-100">
          <button
            onClick={exportToEmail}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mr-3 transition-colors"
          >
            📧 Mail naar Gemeente
          </button>
          <button
            onClick={exportToWhatsApp}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            💬 Deel in WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}