'use client'
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ComingSoonPage= () => {
  const router = useRouter();
  // Set the launch date (30 days from now)
  const launchDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // State for countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // State for email input
  const [email, setEmail] = useState('');

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = launchDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []); // Empty dependency array - will only run once on mount

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally save the email to a database
    toast({
      title: "Thank you!",
      description: "We'll notify you when we launch.",
    });
    setEmail('');
  };

  // Format numbers to always have two digits
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] p-4">
      <div className="max-w-2xl w-full text-center bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20 space-y-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <Clock 
            size={80} 
            strokeWidth={1.5} 
            className="text-white opacity-80 animate-pulse"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Coming Soon
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 max-w-md mx-auto">
          We&apos;re working hard to bring something amazing. Stay tuned for our exciting launch!
        </p>
        
        <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:shadow-lg transition duration-300">
          <div className="grid grid-cols-4 gap-4 text-white">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-white/5 rounded-lg p-3 shadow-inner">
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-sm opacity-70 mt-2">Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-white/5 rounded-lg p-3 shadow-inner">
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-sm opacity-70 mt-2">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-white/5 rounded-lg p-3 shadow-inner">
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-sm opacity-70 mt-2">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-white/5 rounded-lg p-3 shadow-inner">
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-sm opacity-70 mt-2">Seconds</div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-center md:space-x-4">
            <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for updates" 
            className="bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 w-full md:w-auto"
          />
          <Button 
            type="submit"
            className="w-full md:w-auto bg-white text-[#7E69AB] hover:bg-white/90 transition-colors"
          >
            Notify Me
          </Button>
        </form>
        
        <div className="flex justify-center space-x-4 pt-4">
          <a href="#" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
            </svg>
          </a>
          <a href="#" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
          </a>
          <a href="#" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;