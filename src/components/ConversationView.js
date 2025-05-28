import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Download,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Info,
  Loader2,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';
import './ConversationView.css';

const ConversationView = ({ initialQuery, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [currentView, setCurrentView] = useState('article-list'); // 'article-list' or 'article-detail'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articlesData, setArticlesData] = useState(null);
  const messagesEndRef = useRef(null);
  const responseHeaderRef = useRef(null);

  const toggleSection = (messageId, section) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${messageId}-${section}`]: !prev[`${messageId}-${section}`]
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    setCurrentView('article-detail');
    // Clear any existing follow-up messages when switching to detail view
    setNewMessage('');

    // Scroll to top of detail view
    setTimeout(() => {
      if (responseHeaderRef.current) {
        responseHeaderRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const getPriorityClass = (priorityLabel) => {
    if (!priorityLabel) return '';

    const label = priorityLabel.toLowerCase();
    if (label.includes('critical') || label.includes('regulatory')) {
      return 'priority-critical';
    } else if (label.includes('high') || label.includes('financial')) {
      return 'priority-high';
    } else if (label.includes('competitive') || label.includes('threat')) {
      return 'priority-medium';
    } else if (label.includes('opportunity')) {
      return 'priority-opportunity';
    } else if (label.includes('strategic')) {
      return 'priority-strategic';
    }
    return 'priority-strategic'; // default
  };

  const handleBackToArticles = () => {
    setCurrentView('article-list');
    setSelectedArticle(null);
    setNewMessage('');
  };

  const generateMockResponse = useCallback((query) => {
    const lowerQuery = query.toLowerCase();

    // Generate multiple prioritized articles based on query
    if (lowerQuery.includes('eu') || lowerQuery.includes('europe') || lowerQuery.includes('regulation') || lowerQuery.includes('plastic')) {
      return generatePrioritizedArticles('eu_regulation', query);
    } else if (lowerQuery.includes('cbam') || lowerQuery.includes('carbon') || lowerQuery.includes('border')) {
      return generatePrioritizedArticles('cbam', query);
    } else if (lowerQuery.includes('esg') || lowerQuery.includes('comprehensive')) {
      return generatePrioritizedArticles('comprehensive_esg', query);
    } else if (lowerQuery.includes('circular') || lowerQuery.includes('recycl')) {
      return generatePrioritizedArticles('circular_economy', query);
    } else if (lowerQuery.includes('competitor') || lowerQuery.includes('sabic') || lowerQuery.includes('dow')) {
      return generatePrioritizedArticles('competitive', query);
    } else if (lowerQuery.includes('market') || lowerQuery.includes('trend')) {
      return generatePrioritizedArticles('market_trends', query);
    } else {
      return generatePrioritizedArticles('general', query); // Default response
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery) {
      // Add initial user message
      const userMessage = {
        id: 1,
        type: 'user',
        content: initialQuery,
        timestamp: new Date()
      };

      setMessages([userMessage]);
      setIsLoading(true);
      setCurrentView('article-list'); // Start with article list view

      // Simulate AI response after delay
      setTimeout(() => {
        const responseData = generateMockResponse(initialQuery);
        setArticlesData(responseData); // Store articles data separately

        const aiResponse = {
          id: 2,
          type: 'assistant',
          content: responseData,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);

        // Scroll to response header after a brief delay to allow rendering
        setTimeout(() => {
          if (responseHeaderRef.current) {
            responseHeaderRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      }, 2000);
    }
  }, [initialQuery, generateMockResponse]);

  const generatePrioritizedArticles = (category, originalQuery) => {
    const articles = [];
    const usedArticleTypes = new Set(); // Track used article types to prevent duplicates

    // Priority 1: Critical regulatory compliance (highest priority)
    // Priority 2: High financial impact (€100M+ revenue/cost impact)
    // Priority 3: Immediate competitive threats
    // Priority 4: Time-sensitive opportunities
    // Priority 5: Medium-term strategic considerations (lowest priority)

    const addUniqueArticle = (articleGenerator, articleType, priority, priorityLabel) => {
      if (!usedArticleTypes.has(articleType)) {
        const article = articleGenerator();

        // Normalize article structure to ensure consistency
        const normalizedArticle = {
          ...article,
          priority,
          priorityLabel,
          articleId: articleType,
          // Ensure all articles have detailedFindings for consistent rendering
          detailedFindings: article.detailedFindings || article.keyFindings || [],
          // Ensure all articles have sources
          sources: article.sources || [],
          // Ensure all articles have topFindings for the summary section
          topFindings: article.topFindings || (article.keyFindings ? article.keyFindings.slice(0, 3) : [])
        };

        articles.push(normalizedArticle);
        usedArticleTypes.add(articleType);
      }
    };

    switch (category) {
      case 'eu_regulation':
        addUniqueArticle(generateEURegulationReport, 'eu_regulation', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateCBAMReport, 'cbam', 2, 'High Financial Impact');
        break;
      case 'cbam':
        addUniqueArticle(generateCBAMReport, 'cbam', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateEURegulationReport, 'eu_regulation', 2, 'High Financial Impact');
        break;
      case 'comprehensive_esg':
        addUniqueArticle(generateEURegulationReport, 'eu_regulation', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateComprehensiveESGReport, 'comprehensive_esg', 2, 'High Financial Impact');
        break;
      case 'circular_economy':
        addUniqueArticle(generateCircularEconomyReport, 'circular_economy', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateEURegulationReport, 'eu_regulation', 2, 'High Financial Impact');
        break;
      case 'competitive':
        addUniqueArticle(generateCompetitorReport, 'competitive', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateEURegulationReport, 'eu_regulation', 2, 'High Financial Impact');
        break;
      case 'market_trends':
        addUniqueArticle(generateMarketTrendsReport, 'market_trends', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateCircularEconomyReport, 'circular_economy', 2, 'High Financial Impact');
        break;
      default:
        addUniqueArticle(generateEURegulationReport, 'eu_regulation', 1, 'Critical Regulatory Compliance');
        addUniqueArticle(generateCBAMReport, 'cbam', 2, 'High Financial Impact');
    }

    // Sort articles by priority (1 = highest, 5 = lowest)
    articles.sort((a, b) => a.priority - b.priority);

    return {
      responseType: 'multi_article',
      originalQuery: originalQuery,
      totalArticles: articles.length,
      articles: articles
    };
  };

  const generateEURegulationReport = () => {
    return {
      reportType: "EU Packaging Regulations Impact",
      problem: "New EU regulations threaten €2.1B in annual revenue",
      impact: "65% of Borouge's EU exports affected by recycled content requirements",
      urgency: "18 months to compliance deadline",
      opportunity: "€150-250M premium pricing potential for sustainable products",
      topFindings: [
        {
          type: "regulatory",
          title: "Mandatory Recycled Content Requirements",
          impact: "Critical",
          description: "30% recycled content required by 2030, affecting €2.1B revenue stream",
          action: "Secure recycling partnerships immediately"
        },
        {
          type: "financial",
          title: "Investment Requirements",
          impact: "High",
          description: "$800M-1.2B needed for compliance infrastructure",
          action: "Establish dedicated compliance budget"
        },
        {
          type: "competitive",
          title: "SABIC Competitive Threat",
          impact: "High",
          description: "Risk losing 15-20% EU market share to competitors",
          action: "Accelerate sustainable product development"
        }
      ],
      detailedFindings: [
        {
          type: "regulatory",
          title: "EU Packaging & Packaging Waste Regulation (PPWR) 2024",
          impact: "High",
          urgency: "Critical",
          description: "New mandatory recycled content requirements: 30% for plastic packaging by 2030, 65% by 2040. Affects €2.1B of Borouge's annual EU revenue stream.",
          details: "The regulation specifically targets polyethylene and polypropylene packaging, Borouge's core products. Non-compliance results in market access restrictions and potential fines up to 4% of annual turnover.",
          confidence: 98,
          timeline: "Implementation: Jan 2025, Full compliance: 2030",
          isBorogueSpecific: false
        },
        {
          type: "financial",
          title: "Compliance Investment Requirements",
          impact: "High",
          urgency: "High",
          description: "Estimated $800M-1.2B investment needed for recycling infrastructure and product reformulation to meet EU standards.",
          details: "Investment breakdown: $400M for chemical recycling facilities, $300M for mechanical recycling partnerships, $200M for R&D and product development, $100M for supply chain modifications.",
          confidence: 85,
          timeline: "Investment period: 2024-2027",
          isBorogueSpecific: false
        },
        {
          type: "competitive",
          title: "Competitive Landscape Shift",
          impact: "High",
          urgency: "High",
          description: "SABIC and Dow advancing rapidly in recycled content integration, potentially gaining first-mover advantage.",
          details: "SABIC's €2B circular economy investment and Dow's advanced recycling partnerships position them ahead. Borouge risks losing 15-20% EU market share without immediate action.",
          confidence: 92,
          timeline: "Competitive threat: Immediate",
          isBorogueSpecific: false
        },
        {
          type: "market",
          title: "Borouge Strategic Partnership with ALPLA Group",
          impact: "High",
          urgency: "Critical",
          description: "Exclusive partnership opportunity with ALPLA Group to secure 40% of required recycled content supply for EU compliance.",
          details: "Strategic alliance would provide Borouge with preferential access to high-quality recycled polyolefins from ALPLA's European network, ensuring compliance while creating competitive moat against SABIC and Dow.",
          confidence: 94,
          timeline: "Partnership agreement needed within 6 months",
          isBorogueSpecific: true
        },
        {
          type: "technology",
          title: "Borouge Advanced Chemical Recycling Initiative",
          impact: "High",
          urgency: "Medium",
          description: "Proprietary chemical recycling technology development could position Borouge as market leader in circular polyolefins.",
          details: "Investment in advanced pyrolysis and depolymerization technologies would enable Borouge to process mixed plastic waste into virgin-quality feedstock, creating new revenue streams worth €300-500M annually by 2030.",
          confidence: 87,
          timeline: "36 months to commercial deployment",
          isBorogueSpecific: true
        }
      ],
      marketImpact: {
        revenueAtRisk: "€2.1B (65% of EU sales)",
        investmentRequired: "$800M-1.2B",
        timelineForCompliance: "18 months critical path",
        marketOpportunity: "€150-250M premium pricing potential"
      },
      riskAssessment: {
        high: ["Market access restrictions", "Competitive disadvantage", "Regulatory penalties"],
        medium: ["Supply chain disruption", "Technology integration challenges", "Customer relationship impact"],
        low: ["Reputational impact", "Talent acquisition challenges"]
      },
      nextSteps: [
        {
          priority: "Critical",
          action: "Form EU Compliance Task Force",
          timeline: "Next 30 days",
          investment: "$5M",
          description: "Immediate action team to coordinate regulatory response"
        },
        {
          priority: "High",
          action: "Secure Recycling Partnerships",
          timeline: "6 months",
          investment: "$200-300M",
          description: "Lock in technology partnerships before competitors"
        },
        {
          priority: "High",
          action: "Launch Sustainable Product Line",
          timeline: "12 months",
          investment: "$150M",
          description: "Develop premium recycled content products"
        }
      ],
      allRecommendations: [
        {
          priority: "Critical",
          action: "Establish EU Regulatory Compliance Task Force",
          timeline: "Immediate (Q1 2024)",
          investment: "$5M",
          description: "Cross-functional team to coordinate compliance strategy, regulatory monitoring, and stakeholder engagement across EU markets."
        },
        {
          priority: "High",
          action: "Secure Chemical Recycling Technology Partnerships",
          timeline: "6 months (Q2 2024)",
          investment: "$200-300M",
          description: "Strategic partnerships or acquisitions with proven chemical recycling technology providers to ensure recycled content supply."
        },
        {
          priority: "High",
          action: "Launch Sustainable Product Line Development",
          timeline: "12 months (Q4 2024)",
          investment: "$150M",
          description: "Accelerated R&D program for high-recycled-content polyethylene grades targeting premium packaging applications."
        },
        {
          priority: "Medium",
          action: "Establish European Recycling Hub",
          timeline: "24 months (Q4 2025)",
          investment: "$400-500M",
          description: "Dedicated recycling facility in strategic EU location to ensure supply security and cost optimization."
        }
      ],
      competitiveBenchmarking: [
        {
          company: "SABIC",
          strategy: "€2B circular economy investment, 1M tonnes recycled content by 2030",
          advantage: "First-mover in chemical recycling, strong EU presence",
          weakness: "Higher cost base, limited feedstock security"
        },
        {
          company: "Dow",
          strategy: "Advanced recycling partnerships, circular design principles",
          advantage: "Technology leadership, established partnerships",
          weakness: "Focus on specialty applications, limited commodity exposure"
        },
        {
          company: "LyondellBasell",
          strategy: "Molecular recycling technology, circular economy solutions",
          advantage: "Integrated technology development, scale advantages",
          weakness: "Limited EU manufacturing footprint"
        }
      ],
      sources: [
        { title: "EU Packaging & Packaging Waste Regulation", url: "eur-lex.europa.eu", date: "2024-01-15", type: "regulation", confidence: "Official" },
        { title: "European Environment Agency Circular Economy Report", url: "eea.europa.eu", date: "2024-02-01", type: "research", confidence: "High" },
        { title: "SABIC Circular Economy Strategy Update", url: "sabic.com", date: "2024-01-30", type: "corporate", confidence: "High" },
        { title: "Plastics Europe Market Data 2024", url: "plasticseurope.org", date: "2024-02-15", type: "industry", confidence: "High" },
        { title: "McKinsey Circular Economy in Chemicals", url: "mckinsey.com", date: "2024-01-20", type: "consulting", confidence: "Medium" },
        { title: "Wood Mackenzie Petrochemicals Outlook", url: "woodmac.com", date: "2024-02-10", type: "market", confidence: "High" }
      ]
    };
  };

  const generateCBAMReport = () => {
    return {
      reportType: "Carbon Border Adjustment Mechanism (CBAM) Impact Analysis",
      executiveSummary: "CBAM implementation will significantly impact Borouge's EU export economics, with estimated additional costs of €45-75M annually. However, strategic positioning in low-carbon production could create competitive advantages and new market opportunities worth €200-300M by 2030.",
      keyFindings: [
        {
          type: "financial",
          title: "Direct CBAM Cost Impact",
          impact: "High",
          urgency: "Critical",
          description: "Estimated €45-75M annual CBAM liability for Borouge's EU polyethylene exports starting 2026.",
          details: "Based on current carbon intensity of 2.1 tCO2/tonne PE and export volume of 850,000 tonnes/year to EU. CBAM price projected at €60-85/tCO2.",
          confidence: 92,
          timeline: "Implementation: January 2026"
        },
        {
          type: "competitive",
          title: "Competitive Advantage Opportunity",
          impact: "High",
          urgency: "High",
          description: "UAE's renewable energy transition positions Borouge favorably vs. coal-dependent competitors in Asia.",
          details: "Borouge's carbon intensity 40% lower than Chinese producers, 25% lower than US Gulf Coast. Potential to capture market share from high-carbon producers.",
          confidence: 88,
          timeline: "Advantage period: 2026-2035"
        },
        {
          type: "technology",
          title: "Carbon Reduction Investment Requirements",
          impact: "Medium",
          urgency: "High",
          description: "€300-500M investment needed to achieve 50% carbon intensity reduction by 2030.",
          details: "Investment areas: renewable energy integration (€200M), process optimization (€150M), carbon capture utilization (€100M), green hydrogen (€50M).",
          confidence: 85,
          timeline: "Investment period: 2024-2030"
        },
        {
          type: "regulatory",
          title: "CBAM Reporting and Verification Requirements",
          impact: "Medium",
          urgency: "High",
          description: "Complex reporting obligations requiring detailed carbon accounting and third-party verification systems.",
          details: "Quarterly reporting of embedded carbon, verification by accredited bodies, potential penalties for non-compliance up to €50/tCO2 equivalent.",
          confidence: 95,
          timeline: "Reporting starts: October 2023"
        },
        {
          type: "market",
          title: "Premium Low-Carbon Product Opportunity",
          impact: "High",
          urgency: "Medium",
          description: "Growing demand for low-carbon polyethylene could command 10-15% price premium in EU markets.",
          details: "Major brands (Unilever, P&G, Nestlé) committing to low-carbon packaging. Market size estimated at €500M by 2030 for certified low-carbon PE.",
          confidence: 78,
          timeline: "Market development: 2025-2030"
        }
      ],
      marketImpact: {
        revenueAtRisk: "€45-75M annual CBAM costs",
        investmentRequired: "€300-500M carbon reduction",
        timelineForCompliance: "30 months to full implementation",
        marketOpportunity: "€200-300M low-carbon premium potential"
      },
      strategicRecommendations: [
        {
          priority: "Critical",
          action: "Implement Comprehensive Carbon Accounting System",
          timeline: "6 months (Q2 2024)",
          investment: "$10M",
          description: "Deploy enterprise carbon management system for accurate CBAM reporting and carbon footprint optimization."
        },
        {
          priority: "High",
          action: "Accelerate Renewable Energy Integration",
          timeline: "18 months (Q3 2025)",
          investment: "$200M",
          description: "Partner with ADNOC for renewable energy supply agreements and on-site solar installations to reduce carbon intensity."
        },
        {
          priority: "High",
          action: "Develop Low-Carbon Product Certification",
          timeline: "12 months (Q4 2024)",
          investment: "$5M",
          description: "Establish third-party verified low-carbon product lines for premium EU market positioning."
        }
      ],
      sources: [
        { title: "EU CBAM Regulation 2023/956", url: "eur-lex.europa.eu", date: "2023-05-17", type: "regulation", confidence: "Official" },
        { title: "European Commission CBAM Implementation Guide", url: "taxation-customs.ec.europa.eu", date: "2024-01-10", type: "guidance", confidence: "Official" },
        { title: "IEA Petrochemicals Carbon Intensity Database", url: "iea.org", date: "2024-02-05", type: "research", confidence: "High" }
      ]
    };
  };

  const generateComprehensiveESGReport = () => {
    return {
      reportType: "Comprehensive ESG Intelligence Report",
      executiveSummary: "Borouge faces a complex ESG landscape requiring integrated strategy across environmental compliance, social responsibility, and governance excellence. Key priorities include decarbonization ($500M investment), circular economy transition ($300M), and stakeholder engagement enhancement to maintain social license to operate in the UAE and global markets.",
      keyFindings: [
        {
          type: "environmental",
          title: "Decarbonization Pathway Requirements",
          impact: "High",
          urgency: "High",
          description: "Net-zero commitment by 2050 requires 70% emissions reduction, demanding fundamental operational transformation.",
          details: "Current emissions: 4.2M tCO2e annually. Reduction pathway: 30% by 2030 (renewable energy), 50% by 2040 (process innovation), 70% by 2050 (breakthrough technologies).",
          confidence: 90,
          timeline: "Transformation period: 2024-2050"
        },
        {
          type: "social",
          title: "UAE Emiratization and Skills Development",
          impact: "Medium",
          urgency: "High",
          description: "UAE Vision 2071 requires 75% Emirati workforce in strategic sectors, necessitating accelerated localization programs.",
          details: "Current Emiratization: 42%. Target: 75% by 2030. Investment required: $50M for training programs, $30M for educational partnerships, $20M for retention initiatives.",
          confidence: 85,
          timeline: "Achievement target: 2030"
        },
        {
          type: "governance",
          title: "ESG Reporting and Transparency Enhancement",
          impact: "Medium",
          urgency: "Medium",
          description: "Increasing investor and stakeholder demands for comprehensive ESG disclosure and third-party verification.",
          details: "Current ESG reporting covers 60% of material topics. Gap analysis identifies needs in Scope 3 emissions, biodiversity impact, and social value measurement.",
          confidence: 88,
          timeline: "Full compliance: 2025"
        },
        {
          type: "financial",
          title: "Sustainable Finance and Green Bonds Opportunity",
          impact: "High",
          urgency: "Medium",
          description: "Access to $2-3B in green financing for sustainability investments at favorable rates (2-3% below conventional).",
          details: "Green bond market for chemicals growing 25% annually. Borouge eligible for sustainability-linked loans tied to carbon reduction and circular economy targets.",
          confidence: 82,
          timeline: "Financing window: 2024-2027"
        },
        {
          type: "technology",
          title: "Digital ESG Management Platform",
          impact: "Medium",
          urgency: "Medium",
          description: "Integrated ESG data management and reporting platform essential for stakeholder transparency and regulatory compliance.",
          details: "Platform requirements: real-time emissions monitoring, social impact tracking, governance metrics dashboard, automated reporting capabilities.",
          confidence: 75,
          timeline: "Implementation: 2024-2025"
        }
      ],
      strategicRecommendations: [
        {
          priority: "Critical",
          action: "Establish Chief Sustainability Officer Role",
          timeline: "Immediate (Q1 2024)",
          investment: "$2M",
          description: "Senior executive position to lead integrated ESG strategy and ensure board-level accountability for sustainability performance."
        },
        {
          priority: "High",
          action: "Launch Comprehensive Decarbonization Program",
          timeline: "6 months (Q2 2024)",
          investment: "$500M",
          description: "Multi-year program covering renewable energy, process optimization, and breakthrough technology development."
        },
        {
          priority: "High",
          action: "Implement Advanced Emiratization Strategy",
          timeline: "12 months (Q4 2024)",
          investment: "$100M",
          description: "Comprehensive talent development program including partnerships with UAE universities and vocational training institutes."
        }
      ],
      sources: [
        { title: "UAE Vision 2071 Strategic Framework", url: "government.ae", date: "2023-12-01", type: "policy", confidence: "Official" },
        { title: "ADNOC Sustainability Strategy 2030", url: "adnoc.ae", date: "2024-01-15", type: "corporate", confidence: "High" },
        { title: "McKinsey ESG in Chemicals Industry", url: "mckinsey.com", date: "2024-02-01", type: "consulting", confidence: "Medium" }
      ]
    };
  };

  const generateCircularEconomyReport = () => {
    return {
      reportType: "Circular Economy Transition Analysis",
      executiveSummary: "Borouge's transition to circular economy principles presents a $1.5B investment opportunity with potential to capture 30% market share in recycled polyethylene by 2030. Strategic partnerships and technology investments are critical for competitive positioning.",
      keyFindings: [
        {
          type: "market",
          title: "Recycled Polyethylene Market Growth",
          impact: "High",
          urgency: "High",
          description: "Global recycled PE market growing at 8.2% CAGR, reaching $15.6B by 2030.",
          details: "Driven by regulatory requirements and brand commitments. Borouge could capture $4.7B market opportunity through strategic positioning.",
          confidence: 88,
          timeline: "Market expansion: 2024-2030"
        }
      ],
      sources: [
        { title: "Ellen MacArthur Foundation Circular Economy Report", url: "ellenmacarthurfoundation.org", date: "2024-01-10", type: "research", confidence: "High" }
      ]
    };
  };

  const generateCompetitorReport = () => {
    return {
      reportType: "Competitive Intelligence Analysis",
      executiveSummary: "SABIC leads in circular economy investments with $2B commitment, while Dow focuses on advanced recycling partnerships. Borouge must accelerate sustainability initiatives to maintain competitive position in evolving petrochemicals landscape.",
      keyFindings: [
        {
          type: "competitive",
          title: "SABIC Circular Economy Leadership",
          impact: "High",
          urgency: "Critical",
          description: "SABIC's $2B circular economy investment and 1M tonnes recycled content target by 2030 positions them as market leader.",
          details: "SABIC's TRUCIRCLE portfolio and partnerships with Plastic Energy create competitive advantage in sustainable products.",
          confidence: 95,
          timeline: "Competitive threat: Immediate"
        }
      ],
      sources: [
        { title: "SABIC Sustainability Strategy 2030", url: "sabic.com", date: "2024-01-15", type: "corporate", confidence: "High" }
      ]
    };
  };

  const generateMarketTrendsReport = () => {
    return {
      reportType: "Market Trends & Outlook Analysis",
      executiveSummary: "Petrochemicals market experiencing fundamental shift toward sustainability, with 60% of customers prioritizing low-carbon products. Borouge must adapt product portfolio and operations to capture emerging opportunities worth $3-5B by 2030.",
      keyFindings: [
        {
          type: "market",
          title: "Sustainable Packaging Demand Surge",
          impact: "High",
          urgency: "High",
          description: "85% of global brands committed to sustainable packaging by 2030, driving 15-25% premium pricing for certified products.",
          details: "Major customers (Unilever, P&G, Nestlé) mandating recycled content. Market opportunity: $500M premium pricing potential.",
          confidence: 90,
          timeline: "Market shift: 2024-2027"
        }
      ],
      sources: [
        { title: "McKinsey Sustainable Packaging Report", url: "mckinsey.com", date: "2024-02-01", type: "consulting", confidence: "High" }
      ]
    };
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && currentView === 'article-detail' && selectedArticle) {
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        content: newMessage,
        timestamp: new Date(),
        articleContext: selectedArticle.reportType // Add context for follow-up
      };

      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsLoading(true);

      // Simulate AI response with article context
      setTimeout(() => {
        const contextualResponse = generateContextualResponse(newMessage, selectedArticle);
        const aiResponse = {
          id: messages.length + 2,
          type: 'assistant',
          content: contextualResponse,
          timestamp: new Date(),
          articleContext: selectedArticle.reportType
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);

        // Scroll to response header after a brief delay to allow rendering
        setTimeout(() => {
          if (responseHeaderRef.current) {
            responseHeaderRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const exportToPDF = () => {
    // Mock export functionality
    console.log('Exporting conversation to PDF...');
    // In real implementation, use jsPDF or similar
  };

  const generateContextualResponse = (question, article) => {
    // Generate contextual follow-up responses based on the selected article
    return {
      responseType: 'contextual_followup',
      originalQuestion: question,
      articleContext: article.reportType,
      response: `Based on the ${article.reportType} analysis, here's additional insight regarding your question: "${question}"\n\nThis contextual response would provide specific details related to the article's findings and recommendations, maintaining focus on the selected topic while addressing the user's follow-up inquiry.`,
      relatedFindings: article.detailedFindings?.slice(0, 2) || [],
      additionalRecommendations: article.nextSteps?.slice(0, 2) || article.allRecommendations?.slice(0, 2) || []
    };
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content));
  };

  return (
    <motion.div
      className="conversation-view"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="conversation-header">
        {currentView === 'article-list' ? (
          <motion.button
            className="back-btn"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            Back to Search
          </motion.button>
        ) : (
          <motion.button
            className="back-btn"
            onClick={handleBackToArticles}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            Back to Articles
          </motion.button>
        )}

        <div className="conversation-actions">
          <motion.button
            className="action-btn"
            onClick={exportToPDF}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
            Export
          </motion.button>
          <motion.button
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} />
            Share
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <AnimatePresence>
          {currentView === 'article-list' ? (
            // Article List View - Show user query and article previews
            <>
              {messages.filter(msg => msg.type === 'user').map((message, messageIndex) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="user-message">
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {articlesData && (
                <motion.div
                  className="articles-list-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  ref={responseHeaderRef}
                >
                  <div className="articles-header">
                    <h3>Intelligence Analysis: {articlesData.originalQuery}</h3>
                    <div className="articles-summary">
                      <span className="articles-count">{articlesData.totalArticles} Articles Found</span>
                      <span className="priority-note">Sorted by criticality and business impact</span>
                    </div>
                  </div>

                  <div className="articles-grid">
                    {articlesData.articles.map((article, index) => (
                      <motion.div
                        key={article.articleId || index}
                        className={`article-preview-card ${getPriorityClass(article.priorityLabel)}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        onClick={() => handleArticleSelect(article)}
                      >
                        <div className="article-priority-badge">
                          <span className="priority-number">#{index + 1}</span>
                          <span className="priority-label">{article.priorityLabel}</span>
                        </div>

                        <div className="article-preview-content">
                          <h4 className="article-title">{article.reportType}</h4>

                          <div className="article-summary">
                            {article.problem && (
                              <p className="problem-preview">{article.problem}</p>
                            )}
                            {article.executiveSummary && !article.problem && (
                              <p className="executive-summary-preview">
                                {article.executiveSummary.length > 250
                                  ? article.executiveSummary.substring(0, 250) + '...'
                                  : article.executiveSummary}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="article-preview-footer">
                          <div className="article-impact-indicators">
                            {article.impact && (
                              <div className="impact-indicator">
                                <TrendingUp size={12} />
                                <span>{article.impact}</span>
                              </div>
                            )}
                            {article.urgency && (
                              <div className="urgency-indicator">
                                <Clock size={12} />
                                <span>{article.urgency}</span>
                              </div>
                            )}
                            {article.marketImpact?.revenueAtRisk && (
                              <div className="revenue-indicator">
                                <DollarSign size={12} />
                                <span>{article.marketImpact.revenueAtRisk}</span>
                              </div>
                            )}
                          </div>

                          <span className="read-more">Read Analysis →</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            // Article Detail View - Show conversation with selected article
            <>
              {messages.map((message, messageIndex) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.type === 'user' ? (
                    <div className="user-message">
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : (
                    <div className="ai-message">
                      <div className="ai-response">
                        {typeof message.content === 'object' ? (
                          message.content.responseType === 'contextual_followup' ? (
                            // Contextual follow-up response
                            <div className="contextual-response">
                              <div className="response-header">
                                <h3>Follow-up Analysis: {message.content.articleContext}</h3>
                                <div className="context-note">
                                  <span>Contextual response based on selected article</span>
                                </div>
                              </div>
                              <div className="contextual-content">
                                <p>{message.content.response}</p>
                                {message.content.relatedFindings.length > 0 && (
                                  <div className="related-findings">
                                    <h4>Related Findings</h4>
                                    {message.content.relatedFindings.map((finding, index) => (
                                      <div key={index} className="finding-summary">
                                        <strong>{finding.title}</strong>
                                        <p>{finding.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : selectedArticle ? (
                            // Show selected article in detail
                            <div className="article-detail-view">
                              <div className="article-detail-header">
                                <div className="priority-badge-large">
                                  <span className="priority-label">{selectedArticle.priorityLabel}</span>
                                </div>
                                <h3>{selectedArticle.reportType}</h3>
                              </div>

                              <div className="intelligence-report simplified">
                                <div className="report-header">
                                  <div className="report-title-section">
                                    <div className="report-actions">
                                      <button
                                        className="copy-btn secondary"
                                        onClick={() => copyMessage(selectedArticle)}
                                        title="Copy article"
                                      >
                                        <Copy size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Problem-Solution Summary */}
                                {(selectedArticle.problem || selectedArticle.executiveSummary) && (
                                  <div className="problem-solution-summary">
                                    {selectedArticle.problem && (
                                      <div className="problem-statement">
                                        <div className="problem-icon">
                                          <AlertTriangle size={20} />
                                        </div>
                                        <div className="problem-content">
                                          <h4>Business Challenge</h4>
                                          <p>{selectedArticle.problem}</p>
                                          {selectedArticle.impact && selectedArticle.urgency && (
                                            <div className="impact-highlight">
                                              <span className="impact-text">{selectedArticle.impact}</span>
                                              <span className="urgency-text">{selectedArticle.urgency}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {selectedArticle.opportunity && (
                                      <div className="opportunity-statement">
                                        <div className="opportunity-icon">
                                          <Target size={20} />
                                        </div>
                                        <div className="opportunity-content">
                                          <h4>Market Opportunity</h4>
                                          <p>{selectedArticle.opportunity}</p>
                                        </div>
                                      </div>
                                    )}

                                    {selectedArticle.executiveSummary && !selectedArticle.problem && (
                                      <div className="executive-summary">
                                        <h4>Executive Summary</h4>
                                        <p>{selectedArticle.executiveSummary}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Key Insights - Top 3 */}
                                <div className="key-insights">
                                  <h4>Critical Findings</h4>
                                  <div className="insights-grid">
                                    {(selectedArticle.topFindings || selectedArticle.keyFindings?.slice(0, 3) || []).map((finding, index) => (
                                      <motion.div
                                        key={index}
                                        className="insight-card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        <div className="insight-header">
                                          <div className={`impact-indicator ${finding.impact?.toLowerCase()}`}>
                                            {finding.impact === 'Critical' && <AlertTriangle size={16} />}
                                            {finding.impact === 'High' && <TrendingUp size={16} />}
                                            {finding.impact === 'Medium' && <Info size={16} />}
                                          </div>
                                          <span className={`impact-label ${finding.impact?.toLowerCase()}`}>
                                            {finding.impact}
                                          </span>
                                        </div>
                                        <h5>{finding.title}</h5>
                                        <p>{finding.description}</p>
                                        {finding.action && (
                                          <div className="quick-action">
                                            <strong>Action:</strong> {finding.action}
                                          </div>
                                        )}
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>



                                {/* Collapsible Detailed Analysis */}
                                <div className="detailed-sections">
                                  {/* Detailed Findings - Always show if there are findings */}
                                  {(selectedArticle.detailedFindings && selectedArticle.detailedFindings.length > 0) && (
                                    <div className="collapsible-section">
                                      <button
                                        className="section-toggle"
                                        onClick={() => toggleSection(`${message.id}-detail`, 'detailed-findings')}
                                      >
                                        <span>Detailed Analysis</span>
                                        {expandedSections[`${message.id}-detail-detailed-findings`] ?
                                          <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        }
                                      </button>

                                      {expandedSections[`${message.id}-detail-detailed-findings`] && (
                                        <motion.div
                                          className="section-content"
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                        >
                                          <div className="detailed-findings">
                                            {(selectedArticle.detailedFindings || []).map((finding, index) => (
                                      <motion.div
                                        key={index}
                                        className={`finding-card ${finding.isBorogueSpecific ? 'borouge-recommendation' : ''}`}
                                        data-type={finding.type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        <div className="finding-header">
                                          <div
                                            className="finding-icon"
                                            style={{
                                              background: finding.type === 'regulatory' ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' :
                                                         finding.type === 'financial' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' :
                                                         finding.type === 'competitive' ? 'linear-gradient(135deg, #0066cc 0%, #3b82f6 100%)' :
                                                         finding.type === 'market' ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' :
                                                         finding.type === 'technology' ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' :
                                                         finding.type === 'environmental' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' :
                                                         finding.type === 'social' ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' :
                                                         finding.type === 'governance' ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' :
                                                         'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                                            }}
                                          >
                                            {finding.type === 'regulatory' && <AlertTriangle size={20} />}
                                            {finding.type === 'financial' && <TrendingUp size={20} />}
                                            {finding.type === 'competitive' && <Users size={20} />}
                                            {finding.type === 'market' && <TrendingUp size={20} />}
                                            {finding.type === 'technology' && <Info size={20} />}
                                            {finding.type === 'environmental' && <AlertTriangle size={20} />}
                                            {finding.type === 'social' && <Users size={20} />}
                                            {finding.type === 'governance' && <Info size={20} />}
                                          </div>
                                          <div className="finding-title">{finding.title}</div>
                                          <div className="finding-badges">
                                            <div className={`impact-badge ${finding.impact?.toLowerCase()}`}>
                                              {finding.impact} Impact
                                            </div>
                                            {finding.urgency && (
                                              <div className={`urgency-badge ${finding.urgency.toLowerCase()}`}>
                                                {finding.urgency}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <p className="finding-description">{finding.description}</p>
                                        {finding.details && (
                                          <div className="finding-details">
                                            <p>{finding.details}</p>
                                          </div>
                                        )}
                                        {finding.timeline && (
                                          <div className="finding-timeline">
                                            <strong>Timeline:</strong> {finding.timeline}
                                          </div>
                                        )}
                                        {finding.confidence && (
                                          <div className="confidence-bar">
                                            <div className="confidence-label">Confidence: {finding.confidence}%</div>
                                            <div className="confidence-progress">
                                              <motion.div
                                                className="confidence-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${finding.confidence}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          )}

                                  {/* Sources Section - Always show */}
                                  <div className="collapsible-section">
                                    <button
                                      className="section-toggle"
                                      onClick={() => toggleSection(`${message.id}-detail`, 'sources')}
                                    >
                                      <span>Sources & References ({selectedArticle.sources?.length || 0})</span>
                                      {expandedSections[`${message.id}-detail-sources`] ?
                                        <ChevronUp size={16} /> : <ChevronDown size={16} />
                                      }
                                    </button>

                                    {expandedSections[`${message.id}-detail-sources`] && (
                                      <motion.div
                                        className="section-content"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <div className="sources-section">
                                          <div className="sources-grid">
                                            {selectedArticle.sources?.map((source, index) => (
                                              <div key={index} className="source-card">
                                                <div className="source-header">
                                                  <ExternalLink size={14} />
                                                  <span className="source-title">{source.title}</span>
                                                  {source.confidence && (
                                                    <span className={`source-confidence ${source.confidence.toLowerCase()}`}>
                                                      {source.confidence}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="source-meta">
                                                  <span className="source-url">{source.url}</span>
                                                  <span className="source-date">{source.date}</span>
                                                  <span className="source-type">{source.type}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null
                        ) : (
                          <div className="simple-response">{message.content}</div>
                        )}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className="loading-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="loading-content">
              <Loader2 className="loading-spinner" size={20} />
              <span>Analyzing ESG data and regulations...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Only show in article detail view */}
      {currentView === 'article-detail' && selectedArticle && (
        <div className="message-input-container">
          <div className="message-input-box">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask a follow-up question about "${selectedArticle.reportType}"...`}
              className="message-input"
              rows="1"
            />
            <motion.button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ConversationView;
