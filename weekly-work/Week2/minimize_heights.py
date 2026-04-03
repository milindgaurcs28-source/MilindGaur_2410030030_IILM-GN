class Solution:
    def getMinDiff(self, arr, k):
        arr.sort()
        n = len(arr)
        ans = arr[-1] - arr[0]
        
        small = arr[0] + k
        big = arr[-1] - k
        
        if small > big:
            small, big = big, small
        
        for i in range(1, n - 1):
            subtract = arr[i] - k
            add = arr[i] + k
            
            if subtract >= small or add <= big:
                continue
            
            if big - subtract <= add - small:
                small = subtract
            else:
                big = add
        
        return min(ans, big - small)

# Time Complexity: O(n log n)
# Space Complexity: O(1)
