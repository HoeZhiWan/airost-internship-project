export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  groupId: string;
  timestamp: Date;
}

export const sendMessage = async (text: string, userId: string, groupId: string, idToken: string) => {
  try {
    const apiResponse = await fetch('http://localhost:3000/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        text,
        groupId
      })
    });

    if (!apiResponse.ok) {
      throw new Error('API request failed');
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getGroups = async (idToken: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/chat/groups', {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch groups');
    return await response.json();
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error };
  }
};

export const getMessages = async (groupId: string, idToken: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/chat/messages/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, error };
  }
};

export const createGroup = async (name: string, idToken: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/chat/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create group');
    return await response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error };
  }
};
