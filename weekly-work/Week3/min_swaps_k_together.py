class Solution:
    def minSwap(self, arr, k):
        count = sum(1 for num in arr if num <= k)
        
        bad = sum(1 for i in range(count) if arr[i] > k)
        ans = bad
        
        for i in range(len(arr) - count):
            if arr[i] > k:
                bad -= 1
            if arr[i + count] > k:
                bad += 1
            ans = min(ans, bad)
        
        return ans

# Time Complexity: O(n)
# Space Complexity: O(1)
