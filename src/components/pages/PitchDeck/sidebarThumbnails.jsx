import React from 'react';

const SlidePreview = ({ slideNumber }) => {
  const renderPreview = () => {
    switch (slideNumber) {
      case 0:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px] h-full flex">
        {/* Left side with globe placeholder */}
        <div className="w-1/2">
          <div className="w-full h-full bg-gray-100 rounded-r-full flex items-center justify-center">
            <div className="text-[6px] text-gray-400">Globe Image</div>
          </div>
        </div>

        {/* Right side with content */}
        <div className="w-1/2 p-8 flex flex-col justify-between">
          {/* Logo area */}
          <div className="mb-4">
            <div className="w-24 h-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-[4px] text-gray-400">Logo</div>
            </div>
          </div>

          {/* Claim text area */}
          <div className="mb-4">
            <div className="w-full h-12 bg-gray-50 border border-gray-200 rounded">
              <div className="h-1 bg-gray-200 rounded w-3/4 mt-2 mx-2"></div>
              <div className="h-1 bg-gray-200 rounded w-1/2 mt-1 mx-2"></div>
            </div>
          </div>

          {/* Title and date */}
          <div className="mt-auto">
            <div className="h-4 mb-2">
              <div className="h-2 bg-green-800 rounded w-32"></div>
            </div>
            <div className="h-2">
              <div className="h-1 bg-green-800 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  
      case 1:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px]">
        {/* Header */}
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Business Transaction Type
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Business Type Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#527853] p-4 rounded">
              <h3 className="text-white text-center">
                Select type of business operation
              </h3>
            </div>
            <div className="w-full p-4 bg-white border rounded flex items-center justify-between text-gray-700">
              <span className="text-gray-400">Select Business Type</span>
              <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            </div>
          </div>

          {/* Valuation Method Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#527853] p-4 rounded">
              <h3 className="text-white text-center">
                Select Valuation Method
              </h3>
            </div>
            <div className="w-full p-4 bg-white border rounded flex items-center justify-between text-gray-700">
              <span className="text-gray-400">Select Valuation Method</span>
              <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            </div>
          </div>

          {/* Shares Offer Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#527853] p-4 rounded">
              <h3 className="text-white text-center">
                Shares on Offer
              </h3>
            </div>
            <div className="w-full p-4 bg-white border rounded flex items-center justify-between text-gray-700">
              <span className="text-gray-400">Select Shares Offer</span>
              <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            </div>
          </div>

          {/* Currency Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#527853] p-4 rounded">
              <h3 className="text-white text-center">
                Select Currency for representing the data
              </h3>
            </div>
            <div className="w-full p-4 bg-white border rounded flex items-center justify-between text-gray-700">
              <span className="text-gray-400">Select Currency</span>
              <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
        case 2:
          return (
            <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
              <div className="w-[800px]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                    LOGO
                  </div>
                  <h1 className="text-xl font-medium text-[#437549]">Business Name</h1>
                </div>
        
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Column */}
                  <div className="col-span-3">
                    <div className="space-y-4">
                      {/* Product Pictures */}
                      <div>
                        <h2 className="text-xs font-medium mb-2">Product Pictures</h2>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                        </div>
                      </div>
        
                      {/* Key Founders */}
                      <div>
                        <h2 className="text-xs font-medium mb-2">Key Founders</h2>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="aspect-square bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="aspect-square bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
        
                  {/* Right Column */}
                  <div className="col-span-9 space-y-4">
                    {/* Strengths */}
                    <div className="bg-[#437549] p-3 rounded">
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-1">
                            <div className="h-2 bg-[#548960] rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
        
                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded">
                        <div className="h-2 w-20 bg-gray-200 mb-2 rounded"></div>
                        <div className="h-20 bg-gray-50 rounded"></div>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <div className="h-2 w-20 bg-gray-200 mb-2 rounded"></div>
                        <div className="h-20 bg-gray-50 rounded"></div>
                      </div>
                    </div>
        
                    {/* Bottom Section */}
                    <div className="bg-[#437549] p-3 rounded">
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-1">
                            <div className="h-2 bg-[#548960] rounded"></div>
                            <div className="h-2 bg-[#548960] rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        
        case 3:
          return (
            <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
              <div className="w-[800px]">
                <div className="bg-[#527853] p-4">
                  <h2 className="text-white text-center text-xl font-medium">
                    Next 3 Year Journey
                  </h2>
                </div>
                
                <div className="p-8">
                  {/* Timeline container */}
                  <div className="relative flex justify-center items-center mt-12">
                    {/* Green timeline line */}
                    <div className="absolute bg-[#527853] h-2 w-full max-w-4xl rounded-full"></div>
                    
                    {/* Timeline items */}
                    <div className="flex flex-wrap justify-between w-full max-w-4xl mt-10">
                      {['Q3/24', 'Q4/24', 'Q1/25', 'Q2/25', 'H2/25', 'H1/26', 'H2/26'].map((label, index) => (
                        <div 
                          key={index} 
                          className="relative flex flex-col items-center mb-8"
                          style={{
                            width: 'calc(100% / 4 - 20px)',
                          }}
                        >
                          {/* Text box preview */}
                          <div className="h-12 w-full border rounded bg-gray-50"></div>
                          {/* Label preview */}
                          <div className="mt-2 rounded-full bg-gray-200 px-2 py-1 text-[6px]">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );

          case 4:
            return (
              <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
                <div className="w-[800px]">
                  <div className="bg-[#527853] p-4">
                    <h2 className="text-white text-center text-xl font-medium">
                      Historical Performance
                    </h2>
                  </div>
                  
                  <div className="p-8">
                    {/* Three Column Layout */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Volume Column */}
                      <div className="space-y-2">
                        <h3 className="text-[#527853] font-medium text-xs">VOLUME</h3>
                        <div className="border rounded-lg p-2">
                          <div className="h-12 bg-gray-50 rounded flex items-end justify-around p-1">
                            {[5.4, 31.4, 135.3, 256, 423].map((height, i) => (
                              <div
                                key={i}
                                className="w-2 bg-[#527853]"
                                style={{ height: `${(height/423) * 40}px` }}
                              ></div>
                            ))}
                          </div>
                          {/* Input Fields Preview */}
                          <div className="mt-2 space-y-1">
                            {[1, 2].map((i) => (
                              <div key={i} className="h-1 bg-gray-200 rounded w-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
          
                      {/* Revenue Column */}
                      <div className="space-y-2">
                        <h3 className="text-[#527853] font-medium text-xs">REVENUE</h3>
                        <div className="border rounded-lg p-2">
                          <div className="h-12 bg-gray-50 rounded flex items-end justify-around p-1">
                            {[1.63, 12.26, 54.23, 102.94, 171].map((height, i) => (
                              <div
                                key={i}
                                className="w-2 bg-[#527853]"
                                style={{ height: `${(height/171) * 40}px` }}
                              ></div>
                            ))}
                          </div>
                          {/* Input Fields Preview */}
                          <div className="mt-2 space-y-1">
                            {[1, 2].map((i) => (
                              <div key={i} className="h-1 bg-gray-200 rounded w-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
          
                      {/* EBITDA Column */}
                      <div className="space-y-2">
                        <h3 className="text-[#527853] font-medium text-xs">EBITDA</h3>
                        <div className="border rounded-lg p-2">
                          <div className="h-12 bg-gray-50 rounded flex items-end justify-around p-1">
                            {[-0.17, 1.04, 7.33, 16.04, 34].map((height, i) => (
                              <div
                                key={i}
                                className="w-2 bg-[#527853]"
                                style={{ height: `${((height + 0.17)/(34 + 0.17)) * 40}px` }}
                              ></div>
                            ))}
                          </div>
                          {/* Input Fields Preview */}
                          <div className="mt-2 space-y-1">
                            {[1, 2].map((i) => (
                              <div key={i} className="h-1 bg-gray-200 rounded w-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          
            case 5:
              return (
                <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
                  <div className="w-[800px]">
                    <div className="bg-[#527853] p-4">
                      <h2 className="text-white text-center text-xl font-medium">
                        Revenue Model
                      </h2>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <p className="font-medium">Revenue Model Input</p>
                        <div className="border p-2 rounded-md bg-gray-50">
                          <div className="grid grid-cols-7 gap-1">
                            {Array(7).fill(null).map((_, i) => (
                              <div key={i} className="h-2 bg-gray-200 rounded"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="font-medium text-xs">Volume Potential</p>
                          <div className="h-16 bg-gray-50 border rounded-md flex items-end p-1">
                            <div className="w-2 h-4 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-6 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-8 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-10 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-12 bg-green-200 mx-[2px]"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-xs">Revenue Potential</p>
                          <div className="h-16 bg-gray-50 border rounded-md flex items-end p-1">
                            <div className="w-2 h-3 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-5 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-7 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-9 bg-green-200 mx-[2px]"></div>
                            <div className="w-2 h-11 bg-green-200 mx-[2px]"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-xs">Gross Profit</p>
                          <div className="h-16 bg-gray-50 border rounded-md">
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="w-full h-[2px] bg-green-200 relative">
                                <div className="absolute w-1 h-1 bg-green-200 rounded-full" style={{ left: '20%', top: '-2px' }}></div>
                                <div className="absolute w-1 h-1 bg-green-200 rounded-full" style={{ left: '40%', top: '-2px' }}></div>
                                <div className="absolute w-1 h-1 bg-green-200 rounded-full" style={{ left: '60%', top: '-2px' }}></div>
                                <div className="absolute w-1 h-1 bg-green-200 rounded-full" style={{ left: '80%', top: '-2px' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
        // Add this case in the renderPreview function, right after case 5 and before the default case:

// Find case 6 in the renderPreview switch statement and replace it with:

case 6:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px]">
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Profit Estimates and KPIs
          </h2>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Main Data Table Preview */}
          <div className="border rounded overflow-hidden">
            <table className="w-full border-collapse text-[6px]">
              <tbody>
                {['Volume', 'Revenue', 'Gross Profit', 'Employee Costs', 'Other Costs', 'EBITDA'].map((row, i) => (
                  <tr key={row}>
                    <td className="border p-1 bg-gray-50 font-medium">{row}</td>
                    {[1, 2, 3, 4, 5].map((col) => (
                      <td key={col} className="border p-1">
                        <div className="h-1 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                    <td className="border p-1 bg-gray-50">
                      <div className="h-1 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KPI Table Preview */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-50 p-1 flex justify-between items-center">
              <span className="text-[6px] font-medium">Key Performance Indicators</span>
              <div className="h-2 w-2 bg-gray-200 rounded"></div>
            </div>
            <table className="w-full border-collapse text-[6px]">
              <tbody>
                {['Volume', 'ARPU', 'GM', 'EBITDA', 'Cost Efficiency'].map((kpi) => (
                  <tr key={kpi}>
                    <td className="border p-1 font-medium">{kpi}</td>
                    <td className="border p-1 w-8">%</td>
                    {[1, 2, 3, 4, 5].map((year) => (
                      <td key={year} className="border p-1">
                        <div className="h-1 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts Preview */}
          <div className="grid grid-cols-2 gap-2">
            {/* Revenue Chart */}
            <div className="border rounded p-1">
              <div className="text-[6px] text-center mb-1">REVENUE POTENTIAL</div>
              <div className="h-12 bg-gray-50 rounded flex items-end justify-around p-1">
                {[20, 40, 60, 80, 100].map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#82ca9d]"
                    style={{ height: `${height * 0.1}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* EBITDA Chart */}
            <div className="border rounded p-1">
              <div className="text-[6px] text-center mb-1">EBITDA & MARGIN</div>
              <div className="h-12 bg-gray-50 rounded relative">
                {/* Bar chart preview */}
                <div className="absolute inset-0 flex items-end justify-around p-1">
                  {[30, 45, 60, 75, 90].map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#82ca9d]"
                      style={{ height: `${height * 0.1}px` }}
                    ></div>
                  ))}
                </div>
                {/* Line chart preview */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M 0,40 Q 25,30 50,20 T 100,10"
                      fill="none"
                      stroke="#8884d8"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  

  case 7:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px]">
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Historical Performance
          </h2>
        </div>
        
        <div className="p-8">
          {/* KPI Selection Pills */}
          <div className="flex flex-wrap gap-1 mb-4">
            {['Volume', 'Revenue', 'EBITDA', 'GP'].map((kpi) => (
              <div
                key={kpi}
                className="px-2 py-1 rounded-full text-[6px] bg-[#527853] text-white"
              >
                {kpi}
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Volume Chart */}
            <div className="border rounded-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[6px] font-medium">Volume</span>
                <div className="h-2 w-8 bg-gray-100 rounded-full"></div>
              </div>
              <div className="h-16 bg-gray-50 rounded flex items-end justify-around p-1">
                {[20, 40, 60, 80, 100].map((height, i) => (
                  <div
                    key={i}
                    className="w-2 bg-[#527853]"
                    style={{ height: `${height * 0.12}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="border rounded-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[6px] font-medium">Revenue</span>
                <div className="h-2 w-8 bg-gray-100 rounded-full"></div>
              </div>
              <div className="h-16 bg-gray-50 rounded relative">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M 0,16 Q 25,12 50,8 T 100,0"
                    fill="none"
                    stroke="#2E8B57"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>

            {/* EBITDA Chart */}
            <div className="border rounded-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[6px] font-medium">EBITDA</span>
                <div className="h-2 w-8 bg-gray-100 rounded-full"></div>
              </div>
              <div className="h-16 bg-gray-50 rounded flex items-end justify-around p-1">
                {[10, 30, 50, 70, 90].map((height, i) => (
                  <div
                    key={i}
                    className="w-2 bg-[#3CB371]"
                    style={{ height: `${height * 0.12}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* GP Chart */}
            <div className="border rounded-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[6px] font-medium">GP</span>
                <div className="h-2 w-8 bg-gray-100 rounded-full"></div>
              </div>
              <div className="h-16 bg-gray-50 rounded relative">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M 0,16 Q 25,12 50,8 T 100,0"
                    fill="none"
                    stroke="#90EE90"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  case 8:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px]">
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Cash Estimates
          </h2>
        </div>

        <div className="p-8 space-y-6">
          {/* Cash Estimates Table */}
          <div className="border-2 border-[#527853] p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-gray-100 p-2 w-32"></th>
                  {['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map(year => (
                    <th key={year} className="bg-gray-100 p-2 w-24">{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['EBITDA', '(-) W.Capital', '(-) Taxes', 'OCF', '(-) Capex', 'FCF'].map(row => (
                  <tr key={row}>
                    <td className="bg-gray-100 p-2">{row}</td>
                    {[1, 2, 3, 4, 5].map(col => (
                      <td key={col} className="border p-2">
                        <div className="h-2 bg-gray-100 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div>
              <h3 className="text-[#527853] font-medium mb-4">FCF ESTIMATE</h3>
              <div className="h-32 flex items-end justify-around border-b border-gray-300">
                {[
                  { year: 'Y1', value: -10 },
                  { year: 'Y2', value: -15 },
                  { year: 'Y3', value: -20 },
                  { year: 'Y4', value: -25 },
                  { year: 'Y5', value: 30 }
                ].map(({ year, value }) => (
                  <div key={year} className="flex flex-col items-center">
                    <div className="w-8">
                      <div 
                        className={`w-full ${value >= 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ height: `${Math.abs(value)}px` }}
                      ></div>
                    </div>
                    <span className="mt-2 text-xs">{year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Y1 Pie Chart */}
              <div>
                <h3 className="text-[#527853] text-sm font-medium mb-2">
                  CASH SPEND (Y1)
                </h3>
                <div className="aspect-square bg-gray-100 rounded-full relative">
                  <div className="absolute inset-0 border-4 border-green-500 rounded-full"
                       style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)' }}>
                  </div>
                </div>
              </div>

              {/* 5Y Total Pie Chart */}
              <div>
                <h3 className="text-[#527853] text-sm font-medium mb-2">
                  CASH SPEND (5Y Total)
                </h3>
                <div className="aspect-square bg-gray-100 rounded-full relative">
                  <div className="absolute inset-0 border-4 border-green-500 rounded-full"
                       style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)' }}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  

  case 9:
    return (
      <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
        <div className="w-[800px]">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Section - DCF Valuation */}
            <div className="border-4 border-green-700 rounded-lg p-4">
              <h2 className="text-sm font-bold text-green-700 mb-2">DCF Valuation Basis</h2>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded"></div>
              </div>
  
              {/* Mini table preview */}
              <div className="border rounded">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex border-b last:border-b-0 h-4">
                    <div className="w-1/4 border-r bg-gray-50"></div>
                    <div className="w-3/4 grid grid-cols-6">
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <div key={j} className="border-r last:border-r-0"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Right Section */}
            <div className="space-y-4">
              {/* New Issue Section */}
              <div className="border-4 border-green-700 rounded-lg">
                <div className="bg-green-700 h-6"></div>
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <React.Fragment key={i}>
                        <div className="bg-green-600 h-3"></div>
                        <div className="bg-gray-200 h-3"></div>
                        <div className="bg-gray-200 h-3"></div>
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Mini investors table */}
                  <div className="mt-2 border">
                    <div className="grid grid-cols-3 h-3 border-b">
                      <div className="border-r"></div>
                      <div className="border-r"></div>
                      <div></div>
                    </div>
                    <div className="grid grid-cols-3 h-3">
                      <div className="border-r"></div>
                      <div className="border-r"></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Series A Section */}
              <div className="border-4 border-green-700 rounded-lg p-2">
                <div className="flex">
                  <div className="w-1/2">
                    {/* Mini table */}
                    <div className="border">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="grid grid-cols-3 h-3 border-b last:border-b-0">
                          <div className="border-r"></div>
                          <div className="border-r"></div>
                          <div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pie chart preview */}
                  <div className="w-1/2 flex justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-green-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    case 10:
    
      return (
        <div className="w-full h-full p-2 bg-white">
          <div className="grid grid-cols-2 gap-2 h-full">
            {/* Left side - DCF Table */}
            <div className="border-2 border-green-700 p-1">
              <div className="text-[6px] font-bold text-green-700">DCF Valuation Basis</div>
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-gray-200 h-2"></div>
                <div className="bg-gray-200 h-2"></div>
                <div className="bg-gray-200 h-2"></div>
              </div>
              <div className="mt-1 border h-[60%]">
                <div className="bg-blue-50 h-1"></div>
                <div className="bg-white h-1"></div>
                <div className="bg-white h-1"></div>
              </div>
            </div>
    
            {/* Right side - Exit Section */}
            <div className="flex flex-col gap-1">
              <div className="border-2 border-green-700">
                <div className="bg-green-700 text-[6px] text-white text-center">
                  Existing Stake - Exit
                </div>
                <div className="p-1 space-y-1">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-green-600 h-1"></div>
                    <div className="bg-gray-200 h-1"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-blue-600 h-1"></div>
                    <div className="bg-gray-200 h-1"></div>
                  </div>
                </div>
              </div>
              <div className="border-2 border-gray-300 h-4 bg-gray-100"></div>
            </div>
          </div>
        </div>
      );
    // Inside your switch statement in sidebarThumbnails.jsx
  case 11:
    return (
      <div className="w-full h-full bg-white p-2">
        <div className="grid grid-cols-2 gap-2 h-full">
          {/* Left Side - EBITDA Valuation */}
          <div className="border border-green-700 p-1">
            <div className="text-[6px] font-bold text-green-700">EBITDA-based Valuation</div>
            <div className="grid grid-cols-2 gap-1 text-[4px]">
              <div className="bg-gray-100 p-0.5">Multiple x</div>
              <div className="bg-gray-100 p-0.5">Net Debt</div>
            </div>
            {/* Mini table representation */}
            <div className="text-[4px] mt-1">
              <div className="flex border-b">
                <div className="w-1/2">EBITDA</div>
                <div className="w-1/2">xx</div>
              </div>
              <div className="flex border-b">
                <div className="w-1/2">Equity Value</div>
                <div className="w-1/2">xx</div>
              </div>
            </div>
          </div>
  
          {/* Right Side - New Issue & Series A */}
          <div className="flex flex-col gap-1">
            <div className="border border-green-700 p-1">
              <div className="text-[6px] font-bold text-green-700">New Issue</div>
              <div className="text-[4px]">
                <div className="flex justify-between">
                  <span>Pre Money</span>
                  <span>Post Money</span>
                </div>
              </div>
            </div>
            <div className="border border-green-700 p-1">
              <div className="text-[6px] font-bold">Series A</div>
              <div className="text-[4px]">
                <div className="flex justify-between">
                  <span>20%</span>
                  <span>INR xx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    case 12:
    return (
      <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
        <div className="w-[800px]">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Section - EBITDA Valuation */}
            <div className="border-4 border-green-700 rounded-lg p-4">
              <h2 className="text-xl font-bold text-green-700 text-center mb-4">
                EBITDA-based Valuation Basis
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-200 p-2 rounded">EBITDA Multiple</div>
                <div className="bg-gray-200 p-2 rounded">External Net Debt</div>
              </div>
  
              {/* Mini table preview */}
              <div className="border rounded">
                {['EBITDA', '(+) Adjustments', '(-) Adjustments', 'Adjusted EBITDA', 
                  'EBITDA Multiple', 'EV', '(-) Net Debt', 'Equity Value', '# Shares', 'Share Price']
                  .map((row, i) => (
                    <div key={i} className="flex border-b last:border-b-0">
                      <div className="w-1/2 p-2 border-r bg-gray-50">{row}</div>
                      <div className="w-1/2 p-2">
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                ))}
              </div>
  
              {/* Adjustments boxes */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border p-2 rounded">
                  <h3 className="text-sm font-bold mb-2">(+) Adjustments</h3>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="border p-2 rounded">
                  <h3 className="text-sm font-bold mb-2">(-) Adjustments</h3>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Right Section */}
            <div className="space-y-6">
              {/* Exit Section */}
              <div className="border-4 border-green-700 rounded-lg">
                <div className="bg-green-700 text-white p-2 text-center">
                  <h2 className="text-xl font-bold">Existing Stake - Exit</h2>
                  <p className="text-sm">Valuation and Shareholding</p>
                </div>
  
                <div className="p-4 space-y-4">
                  {/* Fields */}
                  {['Valuation', '# Shares', 'Share Price', 'Exit / Transfer %', 
                    'Exit / Transfer Shares', 'Exit / Transfer Value'].map((field, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded text-white ${i < 3 ? 'bg-green-600' : 'bg-blue-600'}`}>
                        {field}
                      </div>
                      <div className="bg-gray-200 p-2 rounded">
                        <div className="h-2 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
  
                  {/* Investors Table */}
                  <table className="w-full border mt-4">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 border-r">Existing Investors</td>
                        <td className="p-2 border-r text-center">100%</td>
                        <td className="p-2 text-center">80%</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r">New Investors</td>
                        <td className="p-2 border-r text-center">-</td>
                        <td className="p-2 text-center">20%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Series A Box */}
              <div className="w-48 border-4 border-gray-300 p-4 bg-gray-200">
                <div className="h-32 flex flex-col justify-center items-center text-sm">
                  <div className="font-bold underline">Series A</div>
                  <div className="text-center mt-2">
                    <div className="h-2 bg-gray-300 rounded w-16 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    


  case 13:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px]">
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Custom Images Upload
          </h2>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Image Upload Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                {/* Text Input Preview */}
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                
                {/* Image Upload Box Preview */}
                <div className="border-2 border-blue-500 rounded-lg h-16 bg-blue-50 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );


  case 14:
  return (
    <div className="w-full h-full bg-white p-1 scale-[0.2] origin-top-left absolute">
      <div className="w-[800px] h-full flex">
        {/* Left side with semi-circular placeholder */}
        <div className="w-1/2">
          <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-r-full flex items-center justify-center">
            <div className="text-[6px] text-gray-400">Image Area</div>
          </div>
        </div>

        {/* Right side with contact info preview */}
        <div className="w-1/2 p-8 space-y-4">
          {/* Contact Details Preview */}
          {['Name', 'Designation', 'Phone', 'Email'].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border border-[#003366] flex items-center justify-center">
                <div className="w-1 h-1 bg-[#003366]"></div>
              </div>
              <div className="h-1 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
          
          {/* Website Preview */}
          <div className="mt-2">
            <div className="h-1 bg-[#003366] rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );



// Add this case in the renderPreview function after case 7:



      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-sm text-gray-400">Slide {slideNumber}</p>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] border rounded-sm shadow-sm overflow-hidden">
      {renderPreview()}
    </div>
  );
};

const SidebarThumbnails = ({ slides, currentSlide, onSlideSelect }) => {
  return (
    <div className="py-2">
      {slides.map((slide) => (
        <div
          key={slide.id}
          className={`p-2 cursor-pointer transition-colors duration-200 ${
            currentSlide === slide.id
              ? 'bg-blue-50 border-l-2 border-blue-500'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSlideSelect(slide.id)}
        >
          <div className="mb-1">
            <SlidePreview slideNumber={slide.id} />
          </div>
          <p className="text-xs text-gray-600">
            {slide.id}. {slide.title}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SidebarThumbnails;
