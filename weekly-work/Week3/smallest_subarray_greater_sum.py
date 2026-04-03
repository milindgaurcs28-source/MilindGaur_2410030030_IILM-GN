class Solution:
    def smallestSubWithSum(self, x, arr):
        n = len(arr)
        min_len = n + 1
        curr_sum = start = 0
        
        for end in range(n):
            curr_sum += arr[end]
            
            while curr_sum > x:
                min_len = min(min_len, end - start + 1)
                curr_sum -= arr[start]
                start += 1
        
        return min_len if min_len <= n else 0

# Time Complexity: O(n)
# Space Complexity: O(1)
