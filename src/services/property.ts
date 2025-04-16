export const getPropertyByTokenAddress = async (tokenAddress: string): Promise<PropertyDto | null> => {
  try {
    const apiUrl = CONTRACT_CONFIG.API_BASE_URL;
    console.log(`Fetching property details for token: ${tokenAddress}`);
    const response = await fetch(`${apiUrl}/properties/token/${tokenAddress}`, {
      signal: AbortSignal.timeout(30000),
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch property ${tokenAddress}: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch property: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    if (!responseText) {
        console.warn(`Received empty response for token ${tokenAddress}`);
        return null;
    }

    try {
        const data = JSON.parse(responseText);
        return data;
    } catch (jsonError) {
        console.error(`Failed to parse JSON response for token ${tokenAddress}:`, jsonError, `Response Text: ${responseText}`);
        throw new Error(`Invalid JSON received from server for token ${tokenAddress}`);
    }
  } catch (error) {
    console.error(`Error fetching property with token address ${tokenAddress}:`, error);
    return null;
  }
}; 