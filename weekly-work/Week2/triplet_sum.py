class Solution:
    def find3Numbers(self, arr, target):
        arr.sort()
        n = len(arr)
        
        for i in range(n - 2):
            left, right = i + 1, n - 1
            while left < right:
                total = arr[i] + arr[left] + arr[right]
                if total == target:
                    return True
                elif total < target:
                    left += 1
                else:
                    right -= 1
        return False

# Time Complexity: O(n^2)
# Space Complexity: O(1)
